/*global QUnit*/

sap.ui.define([
	"comagel.mmts./vendor-map-mdcc/controller/MapView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MapView Controller");

	QUnit.test("I should test the MapView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
