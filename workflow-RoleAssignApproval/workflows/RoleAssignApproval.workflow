{
	"contents": {
		"e09e9564-cc5e-402a-83b6-9f5fb1b36a24": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "roleassignapproval",
			"subject": "RoleAssignApproval",
			"name": "RoleAssignApproval",
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
				"dc23b972-15f4-46c0-9cae-5000084cc139": {
					"name": "ServiceTask2"
				},
				"5c909963-1143-4fc1-88e1-c78e6e29f775": {
					"name": "MailTask1"
				},
				"50b703a3-6173-423d-9ba5-ad0cb604ec36": {
					"name": "UserTask1"
				},
				"3319f36e-6a94-4e41-91cc-6bfcb1219a6c": {
					"name": "MailTask2"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"1b508f94-c3ef-4729-be6f-9817a8ddd40e": {
					"name": "SequenceFlow3"
				},
				"cd337946-4f6c-4946-b4a0-e5f3cf184afb": {
					"name": "SequenceFlow4"
				},
				"c6f3b411-e29e-4344-805d-3364d57448ed": {
					"name": "SequenceFlow5"
				},
				"18e34522-828d-47fb-87da-7228604c5d8c": {
					"name": "SequenceFlow6"
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
				"41203e6d-c3d1-4c04-a7e7-6254048607a4": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"dc23b972-15f4-46c0-9cae-5000084cc139": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "AGEL_MMTS",
			"path": "/api/v2/odata.svc/RoleAssignApprovalRequestSet(${context.RoleAssignRequestID})",
			"httpMethod": "GET",
			"responseVariable": "${context.RoleAssignResponse}",
			"id": "servicetask2",
			"name": "ServiceTask2"
		},
		"5c909963-1143-4fc1-88e1-c78e6e29f775": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask1",
			"name": "MailTask1",
			"mailDefinitionRef": "f4226526-b10a-4c21-9c57-45dda108954f"
		},
		"50b703a3-6173-423d-9ba5-ad0cb604ec36": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.RoleAssignRequestID} Approval",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "suman.shanmugam@extentia.com",
			"formReference": "/forms/RoleAssignApproval/RoleAssignApprovalForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "roleassignapprovalform"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"id": "usertask1",
			"name": "UserTask1"
		},
		"3319f36e-6a94-4e41-91cc-6bfcb1219a6c": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "MailTask2",
			"mailDefinitionRef": "b5916570-ae24-4193-8b9f-f3ebb147f11b"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "dc23b972-15f4-46c0-9cae-5000084cc139"
		},
		"1b508f94-c3ef-4729-be6f-9817a8ddd40e": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "dc23b972-15f4-46c0-9cae-5000084cc139",
			"targetRef": "5c909963-1143-4fc1-88e1-c78e6e29f775"
		},
		"cd337946-4f6c-4946-b4a0-e5f3cf184afb": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "5c909963-1143-4fc1-88e1-c78e6e29f775",
			"targetRef": "50b703a3-6173-423d-9ba5-ad0cb604ec36"
		},
		"c6f3b411-e29e-4344-805d-3364d57448ed": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "50b703a3-6173-423d-9ba5-ad0cb604ec36",
			"targetRef": "3319f36e-6a94-4e41-91cc-6bfcb1219a6c"
		},
		"18e34522-828d-47fb-87da-7228604c5d8c": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow6",
			"name": "SequenceFlow6",
			"sourceRef": "3319f36e-6a94-4e41-91cc-6bfcb1219a6c",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"672c271d-e4cb-4a74-b58c-e49b28c666aa": {},
				"4f6e4221-60cc-40fb-b004-839d9bd83b92": {},
				"e564f48c-0d05-4be1-8af9-9b9807101541": {},
				"c62205ef-30c1-47f9-8ed0-4b14e589df37": {},
				"4597c222-4d4f-4bca-ae30-a5db06cc8199": {},
				"38bf9fd6-118c-4002-adc1-dfe5475bc142": {},
				"e262dc7f-cf84-4cf9-b2ec-ec209e69cd29": {},
				"b3c85b50-bf63-445a-bf89-cef9101168db": {}
			}
		},
		"41203e6d-c3d1-4c04-a7e7-6254048607a4": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/RoleAssignApproval/RoleAssignApprovalRequest.json",
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
			"targetSymbol": "672c271d-e4cb-4a74-b58c-e49b28c666aa",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"672c271d-e4cb-4a74-b58c-e49b28c666aa": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 12,
			"y": 94,
			"width": 100,
			"height": 60,
			"object": "dc23b972-15f4-46c0-9cae-5000084cc139"
		},
		"4f6e4221-60cc-40fb-b004-839d9bd83b92": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,154 62,204",
			"sourceSymbol": "672c271d-e4cb-4a74-b58c-e49b28c666aa",
			"targetSymbol": "e564f48c-0d05-4be1-8af9-9b9807101541",
			"object": "1b508f94-c3ef-4729-be6f-9817a8ddd40e"
		},
		"e564f48c-0d05-4be1-8af9-9b9807101541": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 204,
			"width": 100,
			"height": 60,
			"object": "5c909963-1143-4fc1-88e1-c78e6e29f775"
		},
		"c62205ef-30c1-47f9-8ed0-4b14e589df37": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,264 62,314",
			"sourceSymbol": "e564f48c-0d05-4be1-8af9-9b9807101541",
			"targetSymbol": "4597c222-4d4f-4bca-ae30-a5db06cc8199",
			"object": "cd337946-4f6c-4946-b4a0-e5f3cf184afb"
		},
		"4597c222-4d4f-4bca-ae30-a5db06cc8199": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 12,
			"y": 314,
			"width": 100,
			"height": 60,
			"object": "50b703a3-6173-423d-9ba5-ad0cb604ec36"
		},
		"38bf9fd6-118c-4002-adc1-dfe5475bc142": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,374 62,424",
			"sourceSymbol": "4597c222-4d4f-4bca-ae30-a5db06cc8199",
			"targetSymbol": "e262dc7f-cf84-4cf9-b2ec-ec209e69cd29",
			"object": "c6f3b411-e29e-4344-805d-3364d57448ed"
		},
		"e262dc7f-cf84-4cf9-b2ec-ec209e69cd29": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 12,
			"y": 424,
			"width": 100,
			"height": 60,
			"object": "3319f36e-6a94-4e41-91cc-6bfcb1219a6c"
		},
		"b3c85b50-bf63-445a-bf89-cef9101168db": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "62,484 62,534",
			"sourceSymbol": "e262dc7f-cf84-4cf9-b2ec-ec209e69cd29",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "18e34522-828d-47fb-87da-7228604c5d8c"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 2,
			"sequenceflow": 6,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 2,
			"mailtask": 2
		},
		"f4226526-b10a-4c21-9c57-45dda108954f": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.RoleAssignUserMail}",
			"cc": "akhil.jain@extentia.com,atul.jain@extentia.com,dharmendra.joshi@extentia.com,Suraj.Gavane@extentia.com,suman.shanmugam@extentia.com",
			"subject": "${context.RoleAssignRequestID} Approval",
			"reference": "/webcontent/RoleAssignApproval/RoleAssign.html",
			"id": "maildefinition1"
		},
		"b5916570-ae24-4193-8b9f-f3ebb147f11b": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context.RoleAssignUserMail}",
			"cc": "akhil.jain@extentia.com,atul.jain@extentia.com,dharmendra.joshi@extentia.com,Suraj.Gavane@extentia.com,suman.shanmugam@extentia.com",
			"subject": "Request ${context.RoleAssignRequestID}-${context.RoleAssignStatus} ",
			"text": "Dear ${context.RoleAssignResponse.d.CreatedBy},\n\n your request  ${context.RoleAssignRequestID} for ${context.RoleAssignResponse.d.Role} role assignment has been ${context.RoleAssignStatus} \n\nRegards,\nAGEL MMTS TEAM",
			"id": "maildefinition2"
		}
	}
}