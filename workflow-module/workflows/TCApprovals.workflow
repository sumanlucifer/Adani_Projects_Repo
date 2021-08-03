{
	"contents": {
		"bdfb2e57-b5f0-4736-b981-5d46b0cdcc97": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "tcapprovals",
			"subject": "TCApprovals",
			"name": "TCApprovals",
			"documentation": "Workflow module for TC engineer - BOQ Approval Requests",
			"lastIds": "62d7f4ed-4063-4c44-af8b-39050bd44926",
			"events": {
				"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
					"name": "StartEvent"
				},
				"2798f4e7-bc42-4fad-a248-159095a2f40a": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"e4000acf-98bb-43e2-9b03-20c9cf5ef2c4": {
					"name": "ServiceTaskToFetchDetails"
				},
				"e26d2724-2298-4c3a-8f01-804f35c42997": {
					"name": "ScriptTask2"
				},
				"3fe975b1-e269-4746-9874-a41a5c83761f": {
					"name": "BOQ Approval Request"
				},
				"855fa0dc-af6a-48fc-8a3f-4752c00e717e": {
					"name": "MailTask2"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"9cc3aff4-39e0-4392-b203-f0218930bf91": {
					"name": "SequenceFlow2"
				},
				"dab72e03-490b-409f-a39b-3a12d1035da7": {
					"name": "SequenceFlow4"
				},
				"57d64470-cae6-49d3-8562-2639d4801314": {
					"name": "SequenceFlow5"
				},
				"8f4d98fd-7de1-4cc7-abbb-266be8f9da67": {
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
			"name": "StartEvent",
			"documentation": "Event to start the Workflow Instance.",
			"sampleContextRefs": {
				"3cc74a39-a9d0-4746-929f-cb021830ccf1": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"e4000acf-98bb-43e2-9b03-20c9cf5ef2c4": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "AGEL_MMTS",
			"path": "/api/v2/odata.svc/BOQGroupSet(${context.BOQGroupId})?$expand=BOQItems,ParentLineItem/PurchaseOrder/Buyer,ParentLineItem/PurchaseOrder/Vendor",
			"httpMethod": "GET",
			"responseVariable": "${context.aBOQItems}",
			"headers": [],
			"id": "servicetask1",
			"name": "ServiceTaskToFetchDetails",
			"documentation": "Service Task to fetch details about the task."
		},
		"e26d2724-2298-4c3a-8f01-804f35c42997": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/TCApprovals/Script.js",
			"id": "scripttask2",
			"name": "ScriptTask2"
		},
		"3fe975b1-e269-4746-9874-a41a5c83761f": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.aBOQItems.d.Name}",
			"description": "Approval Request for ${context.aBOQItems.d.TotalChildItemCount} BOQ Items under ${context.aBOQItems.d.ParentLineItem.Name}. ",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "venkatesh.hulekal@extentia.com, atul.jain@extentia.com",
			"formReference": "/forms/TCApprovals/TCApprovalsForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "tcapprovalsform"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"customAttributes": [],
			"id": "usertask1",
			"name": "BOQ Approval Request"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "e4000acf-98bb-43e2-9b03-20c9cf5ef2c4"
		},
		"9cc3aff4-39e0-4392-b203-f0218930bf91": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow2",
			"name": "SequenceFlow2",
			"sourceRef": "e4000acf-98bb-43e2-9b03-20c9cf5ef2c4",
			"targetRef": "e26d2724-2298-4c3a-8f01-804f35c42997"
		},
		"dab72e03-490b-409f-a39b-3a12d1035da7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "e26d2724-2298-4c3a-8f01-804f35c42997",
			"targetRef": "3fe975b1-e269-4746-9874-a41a5c83761f"
		},
		"57d64470-cae6-49d3-8562-2639d4801314": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "3fe975b1-e269-4746-9874-a41a5c83761f",
			"targetRef": "855fa0dc-af6a-48fc-8a3f-4752c00e717e"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"841b1a0c-a7d0-403a-8368-3e76d7a30ffa": {},
				"4f91036d-4186-44e3-bdb9-5563cd624736": {},
				"0cf64319-217d-4217-9250-153fb4767a17": {},
				"63c2a2d3-eb46-4ba0-aa77-685ce4326afc": {},
				"48b5e915-7adf-41ed-9be6-4e9437719b88": {},
				"e922bc80-92fa-4106-a3f7-eb423633ffbe": {},
				"b4c66000-5b1a-4dd4-a0f2-20082c4764ee": {},
				"52246f2a-37d4-4431-9301-97daf5dad104": {}
			}
		},
		"3cc74a39-a9d0-4746-929f-cb021830ccf1": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/TCApprovals/TCApprovalsStartContext.json",
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
			"y": 522,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,44 62,94",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "841b1a0c-a7d0-403a-8368-3e76d7a30ffa",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"841b1a0c-a7d0-403a-8368-3e76d7a30ffa": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "e4000acf-98bb-43e2-9b03-20c9cf5ef2c4"
		},
		"4f91036d-4186-44e3-bdb9-5563cd624736": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "841b1a0c-a7d0-403a-8368-3e76d7a30ffa",
			"targetSymbol": "0cf64319-217d-4217-9250-153fb4767a17",
			"object": "9cc3aff4-39e0-4392-b203-f0218930bf91"
		},
		"0cf64319-217d-4217-9250-153fb4767a17": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "e26d2724-2298-4c3a-8f01-804f35c42997"
		},
		"63c2a2d3-eb46-4ba0-aa77-685ce4326afc": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "0cf64319-217d-4217-9250-153fb4767a17",
			"targetSymbol": "48b5e915-7adf-41ed-9be6-4e9437719b88",
			"object": "dab72e03-490b-409f-a39b-3a12d1035da7"
		},
		"48b5e915-7adf-41ed-9be6-4e9437719b88": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "3fe975b1-e269-4746-9874-a41a5c83761f"
		},
		"e922bc80-92fa-4106-a3f7-eb423633ffbe": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,344 62,445",
			"sourceSymbol": "48b5e915-7adf-41ed-9be6-4e9437719b88",
			"targetSymbol": "b4c66000-5b1a-4dd4-a0f2-20082c4764ee",
			"object": "57d64470-cae6-49d3-8562-2639d4801314"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 2,
			"hubapireference": 1,
			"sequenceflow": 7,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 1,
			"scripttask": 2,
			"mailtask": 2
		},
		"855fa0dc-af6a-48fc-8a3f-4752c00e717e": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "MailTask2",
			"mailDefinitionRef": "fc6ead61-a0f3-4d24-bc29-91b915fafc57"
		},
		"b4c66000-5b1a-4dd4-a0f2-20082c4764ee": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 415,
			"width": 100,
			"height": 60,
			"object": "855fa0dc-af6a-48fc-8a3f-4752c00e717e"
		},
		"8f4d98fd-7de1-4cc7-abbb-266be8f9da67": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow7",
			"name": "SequenceFlow7",
			"sourceRef": "855fa0dc-af6a-48fc-8a3f-4752c00e717e",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"52246f2a-37d4-4431-9301-97daf5dad104": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,445 62,539.5",
			"sourceSymbol": "b4c66000-5b1a-4dd4-a0f2-20082c4764ee",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "8f4d98fd-7de1-4cc7-abbb-266be8f9da67"
		},
		"fc6ead61-a0f3-4d24-bc29-91b915fafc57": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "Venkatesh.Hulekal@extentia.com,Atul.Jain@extentia.com",
			"subject": "Approval Testing",
			"text": "${context.aBOQItems.d.Name} Approval",
			"id": "maildefinition2"
		}
	}
}