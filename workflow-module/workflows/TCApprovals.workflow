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
				"41b2c080-c475-4604-8b9f-1131a850f528": {
					"name": "SequenceFlow8"
				},
				"645bad67-7e6b-46f9-a57a-125a63e311fc": {
					"name": "SequenceFlow9"
				},
				"9e2963c6-2990-4f08-9a2c-76b1ea1b7e63": {
					"name": "SequenceFlow10"
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
			"path": "/api/v2/odata.svc/BOQGroupSet(${context.BOQGroupId})?$expand=BOQItems,ParentLineItem/PurchaseOrder,ParentLineItem/PurchaseOrder/Vendor",
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
		"855fa0dc-af6a-48fc-8a3f-4752c00e717e": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "MailTask2",
			"mailDefinitionRef": "fc6ead61-a0f3-4d24-bc29-91b915fafc57"
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
		"41b2c080-c475-4604-8b9f-1131a850f528": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow8",
			"name": "SequenceFlow8",
			"sourceRef": "e26d2724-2298-4c3a-8f01-804f35c42997",
			"targetRef": "855fa0dc-af6a-48fc-8a3f-4752c00e717e"
		},
		"645bad67-7e6b-46f9-a57a-125a63e311fc": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow9",
			"name": "SequenceFlow9",
			"sourceRef": "855fa0dc-af6a-48fc-8a3f-4752c00e717e",
			"targetRef": "3fe975b1-e269-4746-9874-a41a5c83761f"
		},
		"9e2963c6-2990-4f08-9a2c-76b1ea1b7e63": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow10",
			"name": "SequenceFlow10",
			"sourceRef": "3fe975b1-e269-4746-9874-a41a5c83761f",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
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
				"48b5e915-7adf-41ed-9be6-4e9437719b88": {},
				"b4c66000-5b1a-4dd4-a0f2-20082c4764ee": {},
				"6797ddff-d6f0-4c68-b1a9-49e8e5633808": {},
				"d8f1aac0-fb09-48ca-bae0-2bc558926dba": {},
				"ecdbc89d-112e-4e88-83c3-78e7059a4d15": {}
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
			"height": 61,
			"object": "e26d2724-2298-4c3a-8f01-804f35c42997"
		},
		"48b5e915-7adf-41ed-9be6-4e9437719b88": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 420,
			"width": 100,
			"height": 60,
			"object": "3fe975b1-e269-4746-9874-a41a5c83761f"
		},
		"b4c66000-5b1a-4dd4-a0f2-20082c4764ee": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 319,
			"width": 100,
			"height": 60,
			"object": "855fa0dc-af6a-48fc-8a3f-4752c00e717e"
		},
		"6797ddff-d6f0-4c68-b1a9-49e8e5633808": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,234.5 62,319.5",
			"sourceSymbol": "0cf64319-217d-4217-9250-153fb4767a17",
			"targetSymbol": "b4c66000-5b1a-4dd4-a0f2-20082c4764ee",
			"object": "41b2c080-c475-4604-8b9f-1131a850f528"
		},
		"d8f1aac0-fb09-48ca-bae0-2bc558926dba": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,349 62,420.5",
			"sourceSymbol": "b4c66000-5b1a-4dd4-a0f2-20082c4764ee",
			"targetSymbol": "48b5e915-7adf-41ed-9be6-4e9437719b88",
			"object": "645bad67-7e6b-46f9-a57a-125a63e311fc"
		},
		"ecdbc89d-112e-4e88-83c3-78e7059a4d15": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,450 62,522.5",
			"sourceSymbol": "48b5e915-7adf-41ed-9be6-4e9437719b88",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "9e2963c6-2990-4f08-9a2c-76b1ea1b7e63"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"timereventdefinition": 1,
			"maildefinition": 2,
			"hubapireference": 1,
			"sequenceflow": 10,
			"startevent": 1,
			"boundarytimerevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 1,
			"scripttask": 2,
			"mailtask": 2
		},
		"fc6ead61-a0f3-4d24-bc29-91b915fafc57": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "Akhil.jain@extentia.com,Atul.Jain@extentia.com",
			"subject": "Approval Testing",
			"reference": "/webcontent/TCApprovals/TCMail.html",
			"id": "maildefinition2"
		}
	}
}