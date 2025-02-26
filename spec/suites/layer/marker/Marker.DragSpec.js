import {expect} from 'chai';
import {DomUtil, Map, Marker, Point} from 'leaflet';
import Hand from 'prosthetic-hand';
import {createContainer, removeMapContainer} from '../../SpecHelper.js';

describe('Marker.Drag', () => {
	let map,
	container;

	beforeEach(() => {
		container = createContainer();
		map = new Map(container);
		container.style.width = '600px';
		container.style.height = '600px';
		map.setView([0, 0], 0);
	});

	afterEach(() => {
		removeMapContainer(map, container);
	});

	const MyMarker = Marker.extend({
		_getPosition() {
			return DomUtil.getPosition(this.dragging._draggable._element);
		},
		getOffset() {
			return this._getPosition().subtract(this._initialPos);
		}
	}).addInitHook('on', 'add', function () {
		this._initialPos = this._getPosition();
	});

	describe('drag', () => {

		describe('in CSS scaled container', () => {
			const scale = new Point(2, 1.5);

			beforeEach(() => {
				container.style.webkitTransformOrigin = 'top left';
				container.style.webkitTransform = `scale(${scale.x}, ${scale.y})`;
			});

			it('drags a marker with mouse, compensating for CSS scale', (done) => {
				const marker = new MyMarker([0, 0], {draggable: true}).addTo(map);

				const start = new Point(300, 280);
				const offset = new Point(56, 32);
				const finish = start.add(offset);

				const hand = new Hand({
					timing: 'fastframe',
					onStop() {
						expect(marker.getOffset()).to.eql(offset);

						expect(map.getCenter()).to.be.nearLatLng([0, 0]);
						expect(marker.getLatLng()).to.be.nearLatLng([-40.979898069620134, 78.75]);

						done();
					}
				});
				const toucher = hand.growFinger('mouse');

				const startScaled = start.scaleBy(scale);
				const finishScaled = finish.scaleBy(scale);
				toucher.wait(0).moveTo(startScaled.x, startScaled.y, 0)
					.down().moveBy(5, 0, 20).moveTo(finishScaled.x, finishScaled.y, 1000).up();
			});
		});
	});
});
