import React, {useEffect, useState} from "react";
import {DicomInfo, DicomInfoView, getPatientId, parseByteArray} from "./Dicom";

const SplitView = () => {

    const [dataset, setDataset] = useState(null)
    const [dicomInfo, setDicomInfo] = useState( null )

    useEffect(() => {
        if( dataset ) {
            setDicomInfo( DicomInfo(dataset) )
        }
    }, [dataset])

    const onSelectDicom = (files) => {
        console.log(files)
        let reader = new FileReader()
        reader.onload = (file) => {
            let arrayBuffer = reader.result
            let byteArray = new Uint8Array( arrayBuffer )
            setDataset( parseByteArray( byteArray ) )
        }
        files && reader.readAsArrayBuffer( files[0] )
    }

    return (
        <div>
            SplitView
            <input type={"file"} onChange={(e) => onSelectDicom(e.target.files)} />

            { dicomInfo && DicomInfoView( dicomInfo ) }
        </div>
    )
}

export default  SplitView;
