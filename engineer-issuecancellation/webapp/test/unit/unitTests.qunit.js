/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comagel.mmts./engineer-issuecancellation/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
