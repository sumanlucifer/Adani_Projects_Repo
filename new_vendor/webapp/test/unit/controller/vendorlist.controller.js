/*global QUnit*/

sap.ui.define([
	"comagel.mmts.newvendor./new_vendor/controller/vendorlist.controller"
], function (Controller) {
	"use strict";

	QUnit.module("vendorlist Controller");

	QUnit.test("I should test the vendorlist controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
