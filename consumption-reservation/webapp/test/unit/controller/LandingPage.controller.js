/*global QUnit*/

sap.ui.define([
	"comagel.mmts./consumption-reservation/controller/LandingPage.controller"
], function (Controller) {
	"use strict";

	QUnit.module("LandingPage Controller");

	QUnit.test("I should test the LandingPage controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
