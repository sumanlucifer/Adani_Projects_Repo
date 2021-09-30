{
	"contents": {
		"272e3b00-699a-43e3-8656-033ed97a038c": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "com.agel.mmts.reservationapprovals",
			"subject": "ReservationApprovals",
			"name": "ReservationApprovals",
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
				"a937ced8-1bbc-483e-833d-2bd549b7d18e": {
					"name": "ServiceTask1"
				},
				"3d1d6c1a-e3d0-44c5-b59e-5782625bc060": {
					"name": "MailTask2"
				},
				"3fc2c34d-fa14-40c9-9c5e-db3bc337f8d1": {
					"name": "UserTask4"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"45e9fa55-2105-4de0-94e0-456ad2630d7e": {
					"name": "SequenceFlow4"
				},
				"6d76922a-9c6f-41e5-94f1-0187341e4a25": {
					"name": "SequenceFlow5"
				},
				"ef073a16-d52d-4bf7-aa86-4259c3f482d8": {
					"name": "SequenceFlow7"
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
				"41e96fd6-2b06-4a28-9f95-f8d05f326b90": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"a937ced8-1bbc-483e-833d-2bd549b7d18e": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "AGEL_MMTS",
			"path": "/api/v2/odata.svc/ReturnMaterialReserveSet(${context.ReservationRequestID})?$expand=ReturnedMaterialParent",
			"httpMethod": "GET",
			"responseVariable": "${context.ReservationResponse}",
			"id": "servicetask1",
			"name": "ServiceTask1"
		},
		"3d1d6c1a-e3d0-44c5-b59e-5782625bc060": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "MailTask2",
			"mailDefinitionRef": "c5ac1385-a0d4-490e-ace2-aaaf41238eea"
		},
		"3fc2c34d-fa14-40c9-9c5e-db3bc337f8d1": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.ReservationRequestID} Approval",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "anirban.neogi@extentia.com",
			"formReference": "/forms/ReservationApprovals/ReservationApprovalForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "reservationapprovalform"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"id": "usertask4",
			"name": "UserTask4"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "a937ced8-1bbc-483e-833d-2bd549b7d18e"
		},
		"45e9fa55-2105-4de0-94e0-456ad2630d7e": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "a937ced8-1bbc-483e-833d-2bd549b7d18e",
			"targetRef": "3d1d6c1a-e3d0-44c5-b59e-5782625bc060"
		},
		"6d76922a-9c6f-41e5-94f1-0187341e4a25": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "3d1d6c1a-e3d0-44c5-b59e-5782625bc060",
			"targetRef": "3fc2c34d-fa14-40c9-9c5e-db3bc337f8d1"
		},
		"ef073a16-d52d-4bf7-aa86-4259c3f482d8": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow7",
			"name": "SequenceFlow7",
			"sourceRef": "3fc2c34d-fa14-40c9-9c5e-db3bc337f8d1",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"1d4bafb8-14c2-429a-9830-efe92e4eeb7b": {},
				"afa64729-f9bf-46b6-a6a8-29ded45df722": {},
				"486e1c5c-e842-43ec-ad24-c5618421be2c": {},
				"9ec1eb9c-a711-48ea-8f04-b458441a0768": {},
				"41d36068-bb81-4599-98cf-268a969d715f": {},
				"a601758a-4168-46e8-a204-fddd2a623f79": {}
			}
		},
		"41e96fd6-2b06-4a28-9f95-f8d05f326b90": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/ReservationApprovals/ReturnContext.json",
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
			"targetSymbol": "1d4bafb8-14c2-429a-9830-efe92e4eeb7b",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"1d4bafb8-14c2-429a-9830-efe92e4eeb7b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "a937ced8-1bbc-483e-833d-2bd549b7d18e"
		},
		"afa64729-f9bf-46b6-a6a8-29ded45df722": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "1d4bafb8-14c2-429a-9830-efe92e4eeb7b",
			"targetSymbol": "486e1c5c-e842-43ec-ad24-c5618421be2c",
			"object": "45e9fa55-2105-4de0-94e0-456ad2630d7e"
		},
		"486e1c5c-e842-43ec-ad24-c5618421be2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "3d1d6c1a-e3d0-44c5-b59e-5782625bc060"
		},
		"9ec1eb9c-a711-48ea-8f04-b458441a0768": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "486e1c5c-e842-43ec-ad24-c5618421be2c",
			"targetSymbol": "41d36068-bb81-4599-98cf-268a969d715f",
			"object": "6d76922a-9c6f-41e5-94f1-0187341e4a25"
		},
		"41d36068-bb81-4599-98cf-268a969d715f": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "3fc2c34d-fa14-40c9-9c5e-db3bc337f8d1"
		},
		"a601758a-4168-46e8-a204-fddd2a623f79": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,374 62,424",
			"sourceSymbol": "41d36068-bb81-4599-98cf-268a969d715f",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "ef073a16-d52d-4bf7-aa86-4259c3f482d8"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 1,
			"sequenceflow": 7,
			"startevent": 1,
			"endevent": 1,
			"usertask": 4,
			"servicetask": 1,
			"mailtask": 2
		},
		"c5ac1385-a0d4-490e-ace2-aaaf41238eea": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "akhil.jain@extentia.com,atul.jain@extentia.com,dharmendra.joshi@extentia.com,Suraj.Gavane@extentia.com,anirban.neogi@extentia.com",
			"cc": "suman.shanmugam@extentia.com",
			"subject": "${context.ReservationRequestID} Approval",
			"text": "${context.ReservationRequestID} Approval",
			"id": "maildefinition1"
		}
	}
}