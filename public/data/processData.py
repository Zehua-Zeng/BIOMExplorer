import json
import sys
import os
import re
from xlrd import open_workbook

## original data:
with open("tbi_clusterseq_v1.complete.biom") as data_file:
		data = json.load(data_file)
wb = open_workbook("tbi_clusterseq_v1.complete.xlsx")


#sample = []        #['Colon', 'Stool', 'Ileum']
#treatment = []     #['TBI', 'NAIVE', 'SHAM']
#animal = []        #['1.4', '1.5', '1.1', '1.2', '1.3', '3.4', '3.5', '3.2', '3.3', '3.1', '2.3', '2.2', '2.1', '2.5', '2.4', '4.5', '4.4', '5.2', '5.3', '5.4', '5.5', '4.3', '4.2', '5.1', '4.1']
#cage = []          #['1', '3', '2', '5', '4']

colId2info = {}
for i in range(len(data['columns'])):
	colId = str(data['columns'][i]['id'])
	info = {}
	info['S'] = str(data['columns'][i]['metadata']['Sample source'])
	info['T'] = str(data['columns'][i]['metadata']['Treatment'])
	info['A'] = str(data['columns'][i]['metadata']['Animal'])
	info['C'] = str(data['columns'][i]['metadata']['Cage'])
	info['D'] = str(data['columns'][i]['metadata']['Day'])

	#sample.append(info['S'])
	#treatment.append(info['T'])
	#animal.append(info['A'])
	#cage.append(info['C'])

	colId2info[colId] = info

#print set(sample)
#print set(treatment)
#print set(animal)
#print set(cage)

#print colId2info;


def proRow(data):
	id2st = {}
	for i in range(len(data['rows'])):
		bid = int(data['rows'][i]['id'])
		if 'taxonomy' in data['rows'][i]['metadata']:
			tax = str(data['rows'][i]['metadata']['taxonomy'])
			taxonomy = tax.replace('Family>', '')
			taxonomy = taxonomy.strip('>')
			taxonomy = taxonomy.strip(';')
			taxonomy = taxonomy.split(';')
			if taxonomy[-1].find('>') != -1 and taxonomy[-1] != 'Incertae>Sedis':
				temp_st = taxonomy[-1]
				temp_st = temp_st.split('>', 1)
				taxonomy = taxonomy[:-1]
				taxonomy.append(temp_st[0])
				taxonomy.append(temp_st[1])
			if len(taxonomy) < 8:
				taxonomy.append(taxonomy[-1] + '-NonSpecified')
			finalTax = ';'.join(taxonomy)
			id2st[bid] = finalTax
		else:
			id2st[bid] = "NoTaxonomy"
	return id2st


def buildHierarchy(bst2idlst):
	root = {'name': 'ROOT', "children": []}
	for bst in bst2idlst:
		idlst = bst2idlst[bst]
		parts = bst.split(';')
		currentNode = root
		for i in range(len(parts)):
			children = currentNode["children"]
			nodeName = parts[i]
			childNode = {}
			if i + 1 < len(parts):
				foundChild = False
				for j in range(len(children)):
					if children[j]['name'] == nodeName:
						childNode = children[j]
						foundChild = True
						break
				if not foundChild:
					childNode = {'name': nodeName, 'children': []}
					children.append(childNode)
				currentNode = childNode
			else:
				#childNode = {'name': nodeName}
				#childNode = {'name': nodeName, 'bidLst': idlst}
				tempChildList = []
				for bid in idlst:
					tempChildList.append({'name': str(bid), 'id': 'c-' + str(bid)})
				childNode = {'name': nodeName, 'children': tempChildList}
				children.append(childNode)
	return root


def delChild(root):
	if 'children' in root:
		if len(root['children']) == 1:
			root['name'] = root['name'] + ';' + root['children'][0]['name']
			if 'id' in root['children'][0]:
				root['id'] = root['children'][0]['id']
			if 'children' in root['children'][0]:
				root['children'] = root['children'][0]['children']
			else:
				del root['children']
	if 'children' in root:
		if len(root['children']) == 1:
			delChild(root)
		else:		
			for i in range(len(root['children'])):
				delChild(root['children'][i])


nodeId = 0
pid2pname = {}
def addId(root):
	global nodeId
	if 'id' not in root:
		nodeId += 1
		root['id'] = 'p-' + str(nodeId)
		pid2pname[root['id']] = root['name']
		if "children" in root:
			for child in root["children"]:
				#nodeId += 1
				addId(child)


def getIndex(num):
	if num == -2: 
		return 0
	if num == 0: 
		return 1
	if num == 1: 
		return 2
	if num == 7: 
		return 3
	if num == 28: 
		return 4



#Treemap Data:
def buildTree():
	## ID to Bacteria Name List:
	id2st = proRow(data)
	#proCol(data)
	
	## Bacteria Name List to ID List:
	bst2idlst = {}
	for bid in id2st:
		bst = id2st[bid]
		if bst in bst2idlst:
			bst2idlst[bst].append(bid)
		else:
			bst2idlst[bst] = [bid]
	## Build Hierarchy:
	root = buildHierarchy(bst2idlst)
	delChild(root)
	addId(root)
	return root


#Time-series Data:
bid2time = {}
for sheet in wb.sheets():
	numR = sheet.nrows
	numC = sheet.ncols
	for row in range(1, numR):
		bid = 'c-' + str(int(sheet.cell(row, 0).value))
		bid2time[bid] = {}
		for col in range(1, numC):
			colId = str(sheet.cell(0, col).value)
			print colId;
			cnt = sheet.cell(row, col).value
			if cnt != 0:
				info = colId2info[colId]
				infoStr = 'S:' + info['S'] + ';T:' + info['T'] + ';A:' + info['A'] + ';C:' + info['C']
				index = getIndex(int(info['D']))
				if infoStr in bid2time[bid]:
					bid2time[bid][infoStr][index] = cnt
				else:
					bid2time[bid][infoStr] = [0, 0, 0, 0, 0]
					bid2time[bid][infoStr][index] = cnt