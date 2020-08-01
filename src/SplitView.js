import React, { useEffect, useRef, useState } from "react";
import { constructInfo, getInfoView, draw, parseByteArray } from "./Dicom";

const SplitView = () => {

    const [dataSet, setDataSet] = useState( null )
    const [dicomInfo, setDicomInfo] = useState( null )

    const canvasDicom = useRef( null )

    useEffect(() => {

        if( dataSet ) {

            setDicomInfo( constructInfo(dataSet) )
            draw( { dataSet, canvas: canvasDicom.current } )

        }
    }, [dataSet])

    const onSelectDicom = (files) => {
        console.log(files)
        let reader = new FileReader()
        reader.onload = (file) => {
            let arrayBuffer = reader.result
            let byteArray = new Uint8Array( arrayBuffer )
            setDataSet( parseByteArray( byteArray ) )
        }
        files && reader.readAsArrayBuffer( files[0] )
    }

    return (
        <div>
            SplitView
            <input type={"file"}
                   onChange={ (e) => onSelectDicom(e.target.files) } />

            <canvas id={"canvas-dicom"} ref={canvasDicom} width={512} height={512} />

            { dicomInfo && getInfoView( dicomInfo ) }
        </div>
    )
}

export default  SplitView;
