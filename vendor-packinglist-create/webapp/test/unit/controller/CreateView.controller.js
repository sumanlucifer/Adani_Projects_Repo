/*global QUnit*/

sap.ui.define([
	"comagel.mmts./vendor-packinglist-create/controller/CreateView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("CreateView Controller");

	QUnit.test("I should test the CreateView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
