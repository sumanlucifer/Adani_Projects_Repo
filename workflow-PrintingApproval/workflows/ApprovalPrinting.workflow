{
	"contents": {
		"a8dc7cfd-1c6f-4390-9b05-f0d1b4853999": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "approvalprinting",
			"subject": "ApprovalPrinting",
			"name": "ApprovalPrinting",
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
				"b9360c1a-fef5-4a4b-a88a-6b19b776fa76": {
					"name": "MailTask1"
				},
				"4f2b0a45-0241-4eb7-9b43-4cea93d12b13": {
					"name": "UserTask1"
				},
				"4ae00c1d-a75a-471e-9cff-a337918a09ca": {
					"name": "MailTask2"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"2e6d899c-fb03-473b-bd42-652af706af49": {
					"name": "SequenceFlow3"
				},
				"0ba7a082-200a-4653-b72a-b7ae5bfe31af": {
					"name": "SequenceFlow4"
				},
				"e9e65e93-9d37-482c-8949-610111e37978": {
					"name": "SequenceFlow5"
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
				"508fdf94-a4f8-40d3-83a4-6385b2c96bbf": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"b9360c1a-fef5-4a4b-a88a-6b19b776fa76": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask1",
			"name": "MailTask1",
			"mailDefinitionRef": "24191055-9033-4e6f-b2f5-d693e7757d7f"
		},
		"4f2b0a45-0241-4eb7-9b43-4cea93d12b13": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.PrintRequestID} Approval",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "venkatesh.hulekal@extentia.com",
			"formReference": "/forms/ApprovalPrinting/PrintingForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "printingform"
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
			"targetRef": "b9360c1a-fef5-4a4b-a88a-6b19b776fa76"
		},
		"2e6d899c-fb03-473b-bd42-652af706af49": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "b9360c1a-fef5-4a4b-a88a-6b19b776fa76",
			"targetRef": "4f2b0a45-0241-4eb7-9b43-4cea93d12b13"
		},
		"0ba7a082-200a-4653-b72a-b7ae5bfe31af": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "4f2b0a45-0241-4eb7-9b43-4cea93d12b13",
			"targetRef": "4ae00c1d-a75a-471e-9cff-a337918a09ca"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"7a8d94b1-90e2-4350-a976-5b7b19c46a7f": {},
				"a3d16a5b-cfdc-4b12-afa7-dc45fadf97f3": {},
				"6d25416e-128c-4202-ba1f-8408266b3a0b": {},
				"cd190ef0-4832-4cac-8165-0f4097252d52": {},
				"bba96881-394c-4e08-b207-898fc51de056": {},
				"689b7cbb-2bfc-460d-bffd-2d187798d1ea": {}
			}
		},
		"508fdf94-a4f8-40d3-83a4-6385b2c96bbf": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/ApprovalPrinting/PrintingContext.json",
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
			"targetSymbol": "7a8d94b1-90e2-4350-a976-5b7b19c46a7f",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"7a8d94b1-90e2-4350-a976-5b7b19c46a7f": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "b9360c1a-fef5-4a4b-a88a-6b19b776fa76"
		},
		"a3d16a5b-cfdc-4b12-afa7-dc45fadf97f3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "7a8d94b1-90e2-4350-a976-5b7b19c46a7f",
			"targetSymbol": "6d25416e-128c-4202-ba1f-8408266b3a0b",
			"object": "2e6d899c-fb03-473b-bd42-652af706af49"
		},
		"6d25416e-128c-4202-ba1f-8408266b3a0b": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "4f2b0a45-0241-4eb7-9b43-4cea93d12b13"
		},
		"cd190ef0-4832-4cac-8165-0f4097252d52": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "6d25416e-128c-4202-ba1f-8408266b3a0b",
			"targetSymbol": "bba96881-394c-4e08-b207-898fc51de056",
			"object": "0ba7a082-200a-4653-b72a-b7ae5bfe31af"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 2,
			"sequenceflow": 5,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 1,
			"mailtask": 2
		},
		"24191055-9033-4e6f-b2f5-d693e7757d7f": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.PrintUserMailInfo}",
			"subject": "Printing Approval Request Raised",
			"reference": "/webcontent/PrintApprovals/ApprovalMail.html",
			"id": "maildefinition1"
		},
		"4ae00c1d-a75a-471e-9cff-a337918a09ca": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "MailTask2",
			"mailDefinitionRef": "f9cf777e-efd7-45ed-8c5a-a2944adb957b"
		},
		"bba96881-394c-4e08-b207-898fc51de056": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "4ae00c1d-a75a-471e-9cff-a337918a09ca"
		},
		"e9e65e93-9d37-482c-8949-610111e37978": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "4ae00c1d-a75a-471e-9cff-a337918a09ca",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"689b7cbb-2bfc-460d-bffd-2d187798d1ea": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,374 62,424",
			"sourceSymbol": "bba96881-394c-4e08-b207-898fc51de056",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "e9e65e93-9d37-482c-8949-610111e37978"
		},
		"f9cf777e-efd7-45ed-8c5a-a2944adb957b": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context.RequestedBy}",
			"subject": "Printing Approval Request for ${context.PackingListName}-${context.Status}",
			"text": "Dear ${context.CreatedBy},\n\nYour Printing Approval request for packing list-${context.PackingListName} raised for PO number ${context.PONumber} has been ${context.Status}\n\nPlease login to the application to view the changes.\n\nRegards,\nAGEL MMTS TEAM",
			"id": "maildefinition2"
		}
	}
}