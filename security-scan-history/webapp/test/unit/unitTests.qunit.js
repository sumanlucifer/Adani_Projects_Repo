/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comagel.mmts./security-scan-history/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
