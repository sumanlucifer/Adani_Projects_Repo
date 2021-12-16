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
				"3fe975b1-e269-4746-9874-a41a5c83761f": {
					"name": "BOQ Approval Request"
				},
				"855fa0dc-af6a-48fc-8a3f-4752c00e717e": {
					"name": "MailTask2"
				},
				"3905a22e-888e-4c27-90f5-9da5c2365ac9": {
					"name": "MailTask4"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"645bad67-7e6b-46f9-a57a-125a63e311fc": {
					"name": "SequenceFlow9"
				},
				"9e2963c6-2990-4f08-9a2c-76b1ea1b7e63": {
					"name": "SequenceFlow10"
				},
				"17200ce1-bc97-45ee-87a8-45a65754ad61": {
					"name": "SequenceFlow12"
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
		"3905a22e-888e-4c27-90f5-9da5c2365ac9": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask4",
			"name": "MailTask4",
			"mailDefinitionRef": "9019deb8-af49-498c-a8ab-dbcd231b9ba3"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
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
			"targetRef": "3905a22e-888e-4c27-90f5-9da5c2365ac9"
		},
		"17200ce1-bc97-45ee-87a8-45a65754ad61": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow12",
			"name": "SequenceFlow12",
			"sourceRef": "3905a22e-888e-4c27-90f5-9da5c2365ac9",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"48b5e915-7adf-41ed-9be6-4e9437719b88": {},
				"b4c66000-5b1a-4dd4-a0f2-20082c4764ee": {},
				"d8f1aac0-fb09-48ca-bae0-2bc558926dba": {},
				"ecdbc89d-112e-4e88-83c3-78e7059a4d15": {},
				"f1c523df-9730-4820-bf82-7e3101b85392": {},
				"15ee383d-82a7-4f69-8387-bf00b719bac0": {}
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
			"y": 424,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,44 62,94",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "b4c66000-5b1a-4dd4-a0f2-20082c4764ee",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"48b5e915-7adf-41ed-9be6-4e9437719b88": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "3fe975b1-e269-4746-9874-a41a5c83761f"
		},
		"b4c66000-5b1a-4dd4-a0f2-20082c4764ee": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "855fa0dc-af6a-48fc-8a3f-4752c00e717e"
		},
		"d8f1aac0-fb09-48ca-bae0-2bc558926dba": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "b4c66000-5b1a-4dd4-a0f2-20082c4764ee",
			"targetSymbol": "48b5e915-7adf-41ed-9be6-4e9437719b88",
			"object": "645bad67-7e6b-46f9-a57a-125a63e311fc"
		},
		"ecdbc89d-112e-4e88-83c3-78e7059a4d15": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "48b5e915-7adf-41ed-9be6-4e9437719b88",
			"targetSymbol": "f1c523df-9730-4820-bf82-7e3101b85392",
			"object": "9e2963c6-2990-4f08-9a2c-76b1ea1b7e63"
		},
		"f1c523df-9730-4820-bf82-7e3101b85392": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "3905a22e-888e-4c27-90f5-9da5c2365ac9"
		},
		"15ee383d-82a7-4f69-8387-bf00b719bac0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,374 62,424",
			"sourceSymbol": "f1c523df-9730-4820-bf82-7e3101b85392",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "17200ce1-bc97-45ee-87a8-45a65754ad61"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"timereventdefinition": 1,
			"maildefinition": 4,
			"hubapireference": 1,
			"sequenceflow": 12,
			"startevent": 1,
			"boundarytimerevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 1,
			"scripttask": 2,
			"mailtask": 4
		},
		"fc6ead61-a0f3-4d24-bc29-91b915fafc57": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context.TCUserEmails}",
			"subject": "BOQ Approval Request Raised",
			"reference": "/webcontent/TCApprovals/TCMail.html",
			"id": "maildefinition2"
		},
		"9019deb8-af49-498c-a8ab-dbcd231b9ba3": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition4",
			"to": "${context. RequestedBy}",
			"subject": "Request for ${context.Name}-${context.Status} ",
			"text": "Dear ${context.CreatedBy},\n\nYour BOQ Approval request for ${context.Name} with ID-${context.BOQGroupId} has been ${context.Status}\n\nPlease login to the application to view the changes.\n\nRegards,\nAGEL MMTS TEAM",
			"id": "maildefinition4"
		}
	}
}