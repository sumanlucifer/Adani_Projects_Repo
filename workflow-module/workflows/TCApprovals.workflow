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
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"9cc3aff4-39e0-4392-b203-f0218930bf91": {
					"name": "SequenceFlow2"
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
			"path": "/BOQGroupSet(${context.BOQGroupId})/BOQItems",
			"httpMethod": "GET",
			"responseVariable": "${context.aBOQItems}",
			"id": "servicetask1",
			"name": "ServiceTaskToFetchDetails",
			"documentation": "Service Task to fetch details about the task."
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
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"841b1a0c-a7d0-403a-8368-3e76d7a30ffa": {},
				"4f91036d-4186-44e3-bdb9-5563cd624736": {}
			}
		},
		"3cc74a39-a9d0-4746-929f-cb021830ccf1": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/TCApprovals/TCApprovalsStartContext.json",
			"id": "default-start-context"
		},
		"df898b52-91e1-4778-baad-2ad9a261d30e": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 5.5,
			"y": -208,
			"width": 32,
			"height": 32,
			"object": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3"
		},
		"53e54950-7757-4161-82c9-afa7e86cff2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 4,
			"y": 358,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "21.75,-192 21.75,-62",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "841b1a0c-a7d0-403a-8368-3e76d7a30ffa",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"841b1a0c-a7d0-403a-8368-3e76d7a30ffa": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": -28,
			"y": -92,
			"width": 100,
			"height": 60,
			"object": "e4000acf-98bb-43e2-9b03-20c9cf5ef2c4"
		},
		"4f91036d-4186-44e3-bdb9-5563cd624736": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "21.75,-62 21.75,375.5",
			"sourceSymbol": "841b1a0c-a7d0-403a-8368-3e76d7a30ffa",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "9cc3aff4-39e0-4392-b203-f0218930bf91"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"hubapireference": 1,
			"sequenceflow": 3,
			"startevent": 1,
			"endevent": 1,
			"servicetask": 1,
			"scripttask": 1
		}
	}
}