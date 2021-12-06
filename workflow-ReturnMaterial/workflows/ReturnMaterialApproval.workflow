{
	"contents": {
		"0b380707-0b45-4950-8bbb-b2b78657386d": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "returnmaterialapproval",
			"subject": "ReturnMaterialApproval",
			"name": "ReturnMaterialApproval",
			"documentation": "",
			"lastIds": "62d7f4ed-4063-4c44-af8b-39050bd44926",
			"events": {
				"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
					"name": "StartEvent1"
				},
				"2798f4e7-bc42-4fad-a248-159095a2f40a": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"9e773a88-6f51-4782-815c-aebfc9edcdfb": {
					"name": "ServiceTask1"
				},
				"5b6cffe6-8d8c-4c92-80a5-c589a9c760f8": {
					"name": "MailTask1"
				},
				"fe887841-40ca-4445-8037-f90495901289": {
					"name": "UserTask1"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"998d30b5-8c7b-438f-ad40-96e8c318b9ae": {
					"name": "SequenceFlow2"
				},
				"b42304c1-f757-4f76-8f5e-72eac968903e": {
					"name": "SequenceFlow3"
				},
				"84635f2f-0db5-40f8-9fa6-a6c163fecaff": {
					"name": "SequenceFlow4"
				}
			},
			"diagrams": {
				"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {}
			}
		},
		"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "StartEvent1",
			"sampleContextRefs": {
				"cf5c0f16-0381-4fed-874a-62f7e680828c": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"9e773a88-6f51-4782-815c-aebfc9edcdfb": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "AGEL_MMTS",
			"path": "/api/v2/odata.svc/ReturnMaterialReserveSet(${context.ReservationRequestID})",
			"httpMethod": "GET",
			"responseVariable": "${context.ReservationResponse}",
			"id": "servicetask1",
			"name": "ServiceTask1"
		},
		"5b6cffe6-8d8c-4c92-80a5-c589a9c760f8": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask1",
			"name": "MailTask1",
			"mailDefinitionRef": "4f716eb4-1786-4b8d-9477-6cbf16f497fa"
		},
		"fe887841-40ca-4445-8037-f90495901289": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.ReservationRequestID} Approval",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "suman.shanmugam@extentia.com",
			"formReference": "/forms/ReturnMaterialApproval/ReturnmaterialForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "returnmaterialform"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"id": "usertask1",
			"name": "UserTask1"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "9e773a88-6f51-4782-815c-aebfc9edcdfb"
		},
		"998d30b5-8c7b-438f-ad40-96e8c318b9ae": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow2",
			"name": "SequenceFlow2",
			"sourceRef": "9e773a88-6f51-4782-815c-aebfc9edcdfb",
			"targetRef": "5b6cffe6-8d8c-4c92-80a5-c589a9c760f8"
		},
		"b42304c1-f757-4f76-8f5e-72eac968903e": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "5b6cffe6-8d8c-4c92-80a5-c589a9c760f8",
			"targetRef": "fe887841-40ca-4445-8037-f90495901289"
		},
		"84635f2f-0db5-40f8-9fa6-a6c163fecaff": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "fe887841-40ca-4445-8037-f90495901289",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"e3477327-a25a-4f58-bb99-cc27b5523027": {},
				"f58e2f58-c19a-4c33-91ea-ac69d5ef6479": {},
				"531d3267-6007-4e59-92e4-3f0d3a8f328f": {},
				"c9a8f765-15ed-4412-90f0-c47740cd0f98": {},
				"e9d0390c-2f86-445b-9754-94dc4fa2be3b": {},
				"3a7d1efe-e2af-4317-bbb1-7ccae3f3905d": {}
			}
		},
		"cf5c0f16-0381-4fed-874a-62f7e680828c": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/ReturnMaterialApproval/ReturnMaterialContext.json",
			"id": "default-start-context"
		},
		"df898b52-91e1-4778-baad-2ad9a261d30e": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 46,
			"y": 12,
			"width": 32,
			"height": 32,
			"object": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3"
		},
		"53e54950-7757-4161-82c9-afa7e86cff2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 44.5,
			"y": 424,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,44 62,94",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "e3477327-a25a-4f58-bb99-cc27b5523027",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"e3477327-a25a-4f58-bb99-cc27b5523027": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "9e773a88-6f51-4782-815c-aebfc9edcdfb"
		},
		"f58e2f58-c19a-4c33-91ea-ac69d5ef6479": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "e3477327-a25a-4f58-bb99-cc27b5523027",
			"targetSymbol": "531d3267-6007-4e59-92e4-3f0d3a8f328f",
			"object": "998d30b5-8c7b-438f-ad40-96e8c318b9ae"
		},
		"531d3267-6007-4e59-92e4-3f0d3a8f328f": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "5b6cffe6-8d8c-4c92-80a5-c589a9c760f8"
		},
		"c9a8f765-15ed-4412-90f0-c47740cd0f98": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "531d3267-6007-4e59-92e4-3f0d3a8f328f",
			"targetSymbol": "e9d0390c-2f86-445b-9754-94dc4fa2be3b",
			"object": "b42304c1-f757-4f76-8f5e-72eac968903e"
		},
		"e9d0390c-2f86-445b-9754-94dc4fa2be3b": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "fe887841-40ca-4445-8037-f90495901289"
		},
		"3a7d1efe-e2af-4317-bbb1-7ccae3f3905d": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,374 62,424",
			"sourceSymbol": "e9d0390c-2f86-445b-9754-94dc4fa2be3b",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "84635f2f-0db5-40f8-9fa6-a6c163fecaff"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 1,
			"sequenceflow": 4,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 1,
			"mailtask": 1
		},
		"4f716eb4-1786-4b8d-9477-6cbf16f497fa": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.ReservationMail}",
			"cc": "",
			"subject": "Return Material Request Raised ",
			"reference": "/webcontent/ReturnMaterialApproval/ReturnMaterialApproval.html",
			"id": "maildefinition1"
		}
	}
}