# Sketchup Furniture Export Extender

Extends Sketchup export csv file with fields from object defenition.

List of fields:

- Name,
- Material
- X length
- Y length
- Quantity
- X1 edge
- X2 edge
- Y1 edge
- Y2 edge
- Comment 

## Requirements

Node.js v10

## Install

- npm install

## Commands

- node index.js -a convert -p PATH_TO_CSV_EXPORTS_DIR

## How to use

0. In Sketchup create object and describe it as:
  `SOME OBJECT(string) WIDTH(number)xHEIGHT(number) 1(edge x1=true)0(edge x1=false)1(edge y1)0(edge y2) COMMENT(string)`
0. Export your model as csv to ./csv folder.
0. Execute:
  `node index.js -a convert -p ./csv`
0. Find results in ./csv folder.
