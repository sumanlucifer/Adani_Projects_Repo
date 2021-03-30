/*global QUnit*/

sap.ui.define([
	"com/agel/mmts/engineerInCharge-Inventory/controller/LandingPage.controller"
], function (Controller) {
	"use strict";

	QUnit.module("LandingPage Controller");

	QUnit.test("I should test the LandingPage controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
