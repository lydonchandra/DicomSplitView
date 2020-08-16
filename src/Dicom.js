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
        Id: "x00540400"
        , Rows_uint: "x00280010"
        , Columns_uint: "x00280011"
        , PhotometricInterpretation: "x00280004"
        , Type: "x00080008"
        , BitsAllocated_uint: "x00280100"
        , BitsStored_uint: "x00280101"
        , HighBit_uint: "x00280102"
        , PixelRepresentation_uint: "x00280103"
        , RescaleSlope: "x00281053"
        , RescaleIntercept: "x00281052"
        , PositionPatient: "x00200032"
        , OrientationPatient: "x00200037"
        , PixelSpacing: "x00280030"
        , SamplesPerPixel_uint: "x00280002"
        , PixelDataFloat: "x7fe0008"
        , PixelData: "x7fe00010"
        , ModalityLut: "x00283000"
        , WindowCenter: "x00281050"
        , WindowWidth: "x00281051"
        , VoiLut: "x00283010"
        , PixelPadding: "x00280120"
    }
    , UID: {
        Study : "x0020000d"
        , Series: "x0020000e"
        , Instance: "x00080018"
        , SOPClass: "x00080016"
        , TransferSyntax: "x00020010"
        , FrameOfReference: "x00200052"
    }
}

export const getPixelData = (dataSet, frameIndex = 0) => {
    const pixelDataElem = dataSet.elements[ Tags.Image.PixelData ]
                          || dataSet.elements[ Tags.Image.PixelDataFloat ]

    return pixelDataElem.encapsulatedPixelData ? alert('encapsulated') : getUncompressedImageFrame( dataSet, frameIndex )
}

export const getUncompressedImageFrame = ( dataSet, frameIndex ) => {
    const pixelDataElement =
        dataSet.elements.x7fe00010 || dataSet.elements.x7fe00008;
    const bitsAllocated = dataSet.uint16('x00280100');
    const rows = dataSet.uint16('x00280010');
    const columns = dataSet.uint16('x00280011');
    const samplesPerPixel = dataSet.uint16('x00280002');

    const pixelDataOffset = pixelDataElement.dataOffset;
    const pixelsPerFrame = rows * columns * samplesPerPixel;

    let frameOffset;

    if (bitsAllocated === 8) {
        frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame;
        if (frameOffset >= dataSet.byteArray.length) {
            throw new Error('frame exceeds size of pixelData');
        }

        return new Uint8Array(
            dataSet.byteArray.buffer,
            frameOffset,
            pixelsPerFrame
        );
    } else if (bitsAllocated === 16) {
        frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame * 2;
        if (frameOffset >= dataSet.byteArray.length) {
            throw new Error('frame exceeds size of pixelData');
        }

        return new Uint8Array(
            dataSet.byteArray.buffer,
            frameOffset,
            pixelsPerFrame * 2
        );
    } else if (bitsAllocated === 1) {
        // frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame * 0.125;
        // if (frameOffset >= dataSet.byteArray.length) {
        //     throw new Error('frame exceeds size of pixelData');
        // }
        //
        // return unpackBinaryFrame(dataSet.byteArray, frameOffset, pixelsPerFrame);
    } else if (bitsAllocated === 32) {
        frameOffset = pixelDataOffset + frameIndex * pixelsPerFrame * 4;
        if (frameOffset >= dataSet.byteArray.length) {
            throw new Error('frame exceeds size of pixelData');
        }

        return new Uint8Array(
            dataSet.byteArray.buffer,
            frameOffset,
            pixelsPerFrame * 4
        );
    }

    throw new Error('unsupported pixel format');
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

export const constructInfo = ( dataSet ) => {

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

                    let infoKey = `${keyGroup}_${label}`

                    info[infoKey] = valueString

                })

    })

    return info;
}

export const getInfoView = ( dicomInfo) => {
    let infoJsx = []

    Object.entries( dicomInfo )
        .forEach( ( [ key, value ] ) => {

            infoJsx.push(
                <div>
                    {key} : {value}
                </div>
            );
    } )
    return infoJsx
}

    export const LutMonochrome2 = () => {
        let lut = []
        for ( let idx = 0, byt = 255; idx < 256; idx++, byt-- ) {
            // r, g, b, a
            lut.push( [byt, byt, byt, 0xff] )
        }
        return lut
    }

export const bytesToShortSigned = (bytes) => {
    let byteA = bytes[ 1 ]
    let byteB = bytes[ 0 ]
    let pixelVal

    const sign = byteA & (1 << 7);
    pixelVal = (((byteA & 0xFF) << 8) | (byteB & 0xFF));
    if (sign) {
        pixelVal = 0xFFFF0000 | pixelVal;  // fill in most significant bits with 1's
    }
    return pixelVal
}

    export const getMinMax = ( pixelData ) => {
        let pixelCount = pixelData.length
        let min = 0, max = 0

        for ( let idx = 0; idx < pixelCount; idx += 2 ) {
            let pixelVal = bytesToShortSigned( [
                pixelData[idx],
                pixelData[idx+1]
            ]  )

            if (pixelVal < min)
                min = pixelVal

            if (pixelVal > max)
                max = pixelVal
        }
        return { min, max }
    }

    export const draw = ( { dataSet, canvas } ) => {

        const { width: widthCvs, height: heightCvs} = canvas;

        const monochrome2 = LutMonochrome2()
        const ctx = canvas.getContext( '2d' )
        const imageDataCvs = ctx.createImageData( widthCvs, heightCvs )
        const pixelDataDs = getPixelData( dataSet )
        const pixelCountDs = pixelDataDs.length

        const widthDs = getUintAsString({dataSet, tag: Tags.Image.Columns_uint})
        const heightDs = getUintAsString({dataSet, tag: Tags.Image.Rows_uint})

        const pixelCountCvs = widthCvs * heightCvs * 2;

        const scale = pixelCountCvs / pixelCountDs;

        let { min: minPixel, max: maxPixel } = getMinMax( pixelDataDs )

        const windowWidth = Math.abs( maxPixel - minPixel );
        // let windowCenter = ( maxPixel + minPixel ) / 2.0;

        console.debug( `minPixel: ${minPixel} , maxPixel: ${maxPixel}, ${heightDs}, pixelCount: ${pixelCountDs}, ${pixelCountCvs}, ${widthDs} ${scale} ${widthCvs} ${heightCvs}` )

        if( scale === 1 ) {

            for ( let idxRow = 0; idxRow < heightDs; idxRow++ ) {

                for ( let idxCol = 0; idxCol < widthDs; idxCol++ ) {

                    let idxPixelDs = 2 * ( ( idxRow * widthDs ) + idxCol )

                    const pixelVal = bytesToShortSigned([
                        pixelDataDs [ idxPixelDs ],
                        pixelDataDs [ idxPixelDs + 1 ]
                    ])

                    const binIdx = Math.floor( ( pixelVal - minPixel ) / windowWidth * 256 );

                    let displayVal = monochrome2[ binIdx ]
                    if ( displayVal == null )
                        displayVal = [ 0, 0, 0, 255 ]

                    let idxCanvas = 4 * ( ( idxRow * widthDs ) + idxCol )

                    imageDataCvs.data[ idxCanvas     ] = displayVal[ 0 ]
                    imageDataCvs.data[ idxCanvas + 1 ] = displayVal[ 1 ]
                    imageDataCvs.data[ idxCanvas + 2 ] = displayVal[ 2 ]
                    imageDataCvs.data[ idxCanvas + 3 ] = displayVal[ 3 ]
                }
            }
        }
        else if (scale === 4) {

            for ( let idxRow = 0, idxRowCvs = 0
                    ; idxRow < heightDs
                    ; idxRow++, idxRowCvs += 2 )
            {
                for ( let idxCol = 0, idxColCvs = 0
                        ; idxCol < widthDs
                        ; idxCol++, idxColCvs += 8 )
                {

                    let idxPixelDs = 2 * ( ( idxRow * widthDs ) + idxCol )

                    const pixelVal = bytesToShortSigned([
                        pixelDataDs [ idxPixelDs ],
                        pixelDataDs [ idxPixelDs + 1 ]
                    ])

                    const binIdx = Math.floor( ( pixelVal - minPixel ) / windowWidth * 256 );

                    let displayVal = monochrome2[ binIdx ]
                    if ( displayVal == null )
                        displayVal = [ 0, 0, 0, 255 ]

                    let idxCvsCurr = ( idxRowCvs * widthDs * 8) + idxColCvs
                    let idxCvsCurr2 = ( (idxRowCvs+1) * widthDs * 8) + idxColCvs

                    imageDataCvs.data[ idxCvsCurr     ] = displayVal[ 0 ]
                    imageDataCvs.data[ idxCvsCurr + 1 ] = displayVal[ 1 ]
                    imageDataCvs.data[ idxCvsCurr + 2 ] = displayVal[ 2 ]
                    imageDataCvs.data[ idxCvsCurr + 3 ] = displayVal[ 3 ]
                    imageDataCvs.data[ idxCvsCurr + 4 ] = displayVal[ 0 ]
                    imageDataCvs.data[ idxCvsCurr + 5 ] = displayVal[ 1 ]
                    imageDataCvs.data[ idxCvsCurr + 6 ] = displayVal[ 2 ]
                    imageDataCvs.data[ idxCvsCurr + 7 ] = displayVal[ 3 ]

                    imageDataCvs.data[ idxCvsCurr2     ] = displayVal[ 0 ]
                    imageDataCvs.data[ idxCvsCurr2 + 1 ] = displayVal[ 1 ]
                    imageDataCvs.data[ idxCvsCurr2 + 2 ] = displayVal[ 2 ]
                    imageDataCvs.data[ idxCvsCurr2 + 3 ] = displayVal[ 3 ]
                    imageDataCvs.data[ idxCvsCurr2 + 4 ] = displayVal[ 0 ]
                    imageDataCvs.data[ idxCvsCurr2 + 5 ] = displayVal[ 1 ]
                    imageDataCvs.data[ idxCvsCurr2 + 6 ] = displayVal[ 2 ]
                    imageDataCvs.data[ idxCvsCurr2 + 7 ] = displayVal[ 3 ]
                }
            }

        }

        ctx.putImageData( imageDataCvs, 0, 0 )

    }

