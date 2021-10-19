/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comagel.mmts./self-roleassignment/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
