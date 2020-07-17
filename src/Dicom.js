import * as dicomParser from "dicom-parser"
import React from "react";

const Tags = {
    Patient: {
        Name: 'x00100010',
        Id: 'x00100020',
        BirthDate: 'x00100030',
        Sex: 'x00100040'
    }
    , Study: {
        Description: "x00081030"
        , ProtocolName:"x00181030"
        , AccessionNo: "x00080050"
        , Id: "x00200010"
        , Date: "x00080020"
        , Time: "x00080030"
    }
    , Series: {
        Description: "x0008103e"
        , No: "x00200011"
        , Modality: "x00080060"
        , BodyPart: "x00180015"
        , Date: "x00080021"
        , Time: "x00080031"
    }
    , Instance: {
        No: "x00200013"
        , AcquisitionNo: "x00200012"
        , AcquisitionDate: "x00080022"
        , AcquisitionTime: "x00080032"
        , ContentDate: "x00080023"
        , ContentTime: "x00080033"
    }
    , Image: {
        Rows_uint: "x00280010"
        , Columns_uint: "x00280011"
        , PhotometricInterpretation: "x00280004"
        , ImageType: "x00080008"
        , BitsAllocated_uint: "x00280100"
        , BitsStored_uint: "x00280101"
        , HighBit_uint: "x00280102"
        , PixelRepresentation_uint: "x00280103"
        , RescaleSlope: "x00281053"
        , RescaleIntercept: "x00281052"
        , ImagePositionPatient: "x00200032"
        , ImageOrientationPatient: "x00200037"
        , PixelSpacing: "x00280030"
        , SamplesPerPixel_uint: "x00280002"
    }
}

export const parseByteArray = (byteArray) => {
    // parse byteArray into a DataSet object using the parseDicom library
    let dataSet = dicomParser.parseDicom( byteArray )
    return dataSet
}

export const getUintAsString = ( {dataSet, tag} ) => {
    let elems = dataSet.elements[ tag ]
    let valueString = ''
    switch( elems.length ) {
        case 2:
            valueString = dataSet.uint16( tag )
            break
        case 4:
            valueString = dataSet.uint32( tag )
            break
        default:
            throw new Error(`invalid elements length: ${elems.length}`)
    }
    return valueString
}

export const DicomInfo = (dataSet) => {

    let info = {}
    Object.entries( Tags )
        .forEach( ( [keyGroup, valueGroup] ) => {

            Object.entries( valueGroup )
                .forEach( ( [label, tag] ) => {

                    let valueString

                    if( label.endsWith("_uint") )
                        valueString = getUintAsString( {dataSet, tag} )
                    else
                        valueString = dataSet.string(tag)

                    info[`${keyGroup}${label}`] = valueString

                })

    })

    return info;
}

export const DicomInfoView = (dicomInfo) => {
    let infoJsx = []

    Object.entries( dicomInfo ).forEach( ( [ key, value ] ) => {

        infoJsx.push(
            <div>
                {key} : {value}
            </div>
        );
    } )
    return infoJsx

}

