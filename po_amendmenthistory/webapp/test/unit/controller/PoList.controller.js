/*global QUnit*/

sap.ui.define([
	"comagel.mmts./po_amendmenthistory/controller/PoList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PoList Controller");

	QUnit.test("I should test the PoList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
