{
	"contents": {
		"7038ae89-8772-4cc2-9245-8585fef8eba3": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "mdccapprovalrequest",
			"subject": "MDCCApprovalRequest",
			"name": "MDCCApprovalRequest",
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
				"87e92588-f44d-4045-925d-6f75532814ae": {
					"name": "MailTask1"
				},
				"1b219b97-f423-4c63-99ee-6964bfd3c814": {
					"name": "UserTask1"
				},
				"54f0f164-e099-446e-910e-127f6e407fe2": {
					"name": "MailTask2"
				},
				"b6714a55-000a-4a6f-96bc-ad41dbb1d93b": {
					"name": "ScriptTask1"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"be95a562-1efb-4f82-8e4e-c9b3ead6d71e": {
					"name": "SequenceFlow3"
				},
				"6b6d55af-0fdf-4fd2-9020-28e4100ecf12": {
					"name": "SequenceFlow5"
				},
				"68488725-a4de-4ed7-bcb7-018fdbc0f7f7": {
					"name": "SequenceFlow6"
				},
				"3b7d4333-0071-4904-bc58-ce14578ff6a5": {
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
				"e8b2872e-f161-4cf8-bff5-abc1086688ac": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"87e92588-f44d-4045-925d-6f75532814ae": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask1",
			"name": "MailTask1",
			"mailDefinitionRef": "fe66df94-e03f-4c03-95ea-cf5bf2f36b4f"
		},
		"1b219b97-f423-4c63-99ee-6964bfd3c814": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.MDCCRequestID} Approval",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "suman.shanmugam@extentia.com",
			"recipientGroups": "",
			"formReference": "/forms/MDCCApprovalRequest/MDCCApprovalForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "mdccapprovalform"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"id": "usertask1",
			"name": "UserTask1"
		},
		"54f0f164-e099-446e-910e-127f6e407fe2": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "MailTask2",
			"mailDefinitionRef": "418fb8f2-11ef-4beb-ac65-3ccd107894e1"
		},
		"b6714a55-000a-4a6f-96bc-ad41dbb1d93b": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/PMCGApprovals/setApprovalStatus.js",
			"id": "scripttask1",
			"name": "ScriptTask1"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "87e92588-f44d-4045-925d-6f75532814ae"
		},
		"be95a562-1efb-4f82-8e4e-c9b3ead6d71e": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "87e92588-f44d-4045-925d-6f75532814ae",
			"targetRef": "1b219b97-f423-4c63-99ee-6964bfd3c814"
		},
		"6b6d55af-0fdf-4fd2-9020-28e4100ecf12": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "54f0f164-e099-446e-910e-127f6e407fe2",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"68488725-a4de-4ed7-bcb7-018fdbc0f7f7": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow6",
			"name": "SequenceFlow6",
			"sourceRef": "1b219b97-f423-4c63-99ee-6964bfd3c814",
			"targetRef": "b6714a55-000a-4a6f-96bc-ad41dbb1d93b"
		},
		"3b7d4333-0071-4904-bc58-ce14578ff6a5": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow7",
			"name": "SequenceFlow7",
			"sourceRef": "b6714a55-000a-4a6f-96bc-ad41dbb1d93b",
			"targetRef": "54f0f164-e099-446e-910e-127f6e407fe2"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"f9a8bd65-e2e2-477c-a4ca-1a1c536dcee3": {},
				"d06b2b0a-db65-4ff4-acac-e57dc259c8a9": {},
				"18d0a905-6f92-4970-970f-e142bcfcf72b": {},
				"cb230c90-f682-40b4-953b-f5b16b1cf048": {},
				"33d5bc93-3bc8-4699-9ad4-eeda9345c8ff": {},
				"83060b4c-4d04-48a7-8272-2325d1780146": {},
				"d6079c8e-a08e-40a8-925c-6fb2977f7d11": {},
				"f2e3614c-06a3-4443-a3ff-fabb019dae80": {}
			}
		},
		"e8b2872e-f161-4cf8-bff5-abc1086688ac": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/MDCCApprovalRequest/MDCCContext.json",
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
			"y": 534,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,44 62,94",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "f9a8bd65-e2e2-477c-a4ca-1a1c536dcee3",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"f9a8bd65-e2e2-477c-a4ca-1a1c536dcee3": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "87e92588-f44d-4045-925d-6f75532814ae"
		},
		"d06b2b0a-db65-4ff4-acac-e57dc259c8a9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "f9a8bd65-e2e2-477c-a4ca-1a1c536dcee3",
			"targetSymbol": "18d0a905-6f92-4970-970f-e142bcfcf72b",
			"object": "be95a562-1efb-4f82-8e4e-c9b3ead6d71e"
		},
		"18d0a905-6f92-4970-970f-e142bcfcf72b": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "1b219b97-f423-4c63-99ee-6964bfd3c814"
		},
		"cb230c90-f682-40b4-953b-f5b16b1cf048": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 424,
			"width": 100,
			"height": 60,
			"object": "54f0f164-e099-446e-910e-127f6e407fe2"
		},
		"33d5bc93-3bc8-4699-9ad4-eeda9345c8ff": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,484 62,534",
			"sourceSymbol": "cb230c90-f682-40b4-953b-f5b16b1cf048",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "6b6d55af-0fdf-4fd2-9020-28e4100ecf12"
		},
		"83060b4c-4d04-48a7-8272-2325d1780146": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "b6714a55-000a-4a6f-96bc-ad41dbb1d93b"
		},
		"d6079c8e-a08e-40a8-925c-6fb2977f7d11": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "18d0a905-6f92-4970-970f-e142bcfcf72b",
			"targetSymbol": "83060b4c-4d04-48a7-8272-2325d1780146",
			"object": "68488725-a4de-4ed7-bcb7-018fdbc0f7f7"
		},
		"f2e3614c-06a3-4443-a3ff-fabb019dae80": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,374 62,424",
			"sourceSymbol": "83060b4c-4d04-48a7-8272-2325d1780146",
			"targetSymbol": "cb230c90-f682-40b4-953b-f5b16b1cf048",
			"object": "3b7d4333-0071-4904-bc58-ce14578ff6a5"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 2,
			"sequenceflow": 7,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 2,
			"scripttask": 1,
			"mailtask": 2
		},
		"fe66df94-e03f-4c03-95ea-cf5bf2f36b4f": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.PMCGUserMail}",
<<<<<<< HEAD
			"subject": "MDCC Approval Request Raised",
=======
			"subject": "MDCC Aprroval Requested by ${context.VendorName} (${context.VendorCode})",
>>>>>>> develop
			"reference": "/webcontent/MDCCApprovalRequest/MDCCApprovals.html",
			"id": "maildefinition1"
		},
		"418fb8f2-11ef-4beb-ac65-3ccd107894e1": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context. RequestedBy}  ",
			"subject": "Request for ${context.MDCCNumber}-${context.Status}",
			"text": "Dear ${context.CreatedBy},\n\nYour MDCC Approval request for MDCC number-${context.MDCCNumber} raised for inspection ${context.Notification} has been ${context.Status}\n\nPlease login to the application to view the changes.\n\nRegards,\nAGEL MMTS TEAM",
			"ignoreInvalidRecipients": true,
			"id": "maildefinition2"
		}
	}
}