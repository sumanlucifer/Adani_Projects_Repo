/*global QUnit*/

sap.ui.define([
	"comagel.mmts./user-roleassignment/controller/UserList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("UserList Controller");

	QUnit.test("I should test the UserList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
