/*global QUnit*/

sap.ui.define([
	"comagel.mmts./tcengineer/controller/BOQRequestList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("BOQRequestList Controller");

	QUnit.test("I should test the BOQRequestList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
