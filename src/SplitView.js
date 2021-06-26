import React, { useEffect, useRef, useState } from "react";
import { constructInfo, getInfoView, draw, parseByteArray } from "./Dicom";
import { Button} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Draggable from "react-draggable"
// import Split from 'react-split'

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            display: "flex"
        }
    },
    input: {
        display: 'none'
    },
    canvas: {
        borderStyle: 'dashed',
        borderWidth: '1px'
    }
}))

const CanvasWidth1x = 512
const CanvasWidth2x = 1024

const SplitView = () => {

    const [dataSet, setDataSet] = useState( null )
    const [dicomInfo, setDicomInfo] = useState( null )
    const [currentCanvasWidth, setCurrentCanvasWidth] = useState( CanvasWidth1x )

    const canvasDicom = useRef( null )
    const canvasDicom2 = useRef( null )


    const classes = useStyles();

    const onStart = () => {

    };

    const onStop = () => {

    };
    const dragHandlers = {onStart: onStart, onStop: onStop};

    useEffect(() => {

        if( dataSet ) {

            setDicomInfo( constructInfo(dataSet) )
            draw( { dataSet, canvas: canvasDicom.current } )

        }
    }, [dataSet, currentCanvasWidth])

    const onSelectDicom = (files) => {
        let reader = new FileReader()
        reader.onload = (file) => {
            let arrayBuffer = reader.result
            let byteArray = new Uint8Array( arrayBuffer )
            setDataSet( parseByteArray( byteArray ) )
        }
        files && reader.readAsArrayBuffer( files[0] )
    }

    return (
        <div className={classes.root}>

            <input type={"file"}
                   style={{display: "none"}}
                   id={"upload-input"}
                   onChange={ (e) => onSelectDicom(e.target.files) } />

            <label htmlFor={"upload-input"}>
                <Button variant={"contained"} color={"primary"} component={"span"}>
                    Upload DICOM Monochrome2
                </Button>
            </label>

            <label>
                <Button
                    onClick={() => {
                        setCurrentCanvasWidth(CanvasWidth1x)
                    }}
                    variant={"contained"} color={"secondary"}>
                    1x Canvas
                </Button>
            </label>

            <label>
                <Button
                    onClick={() => {
                        setCurrentCanvasWidth(CanvasWidth2x)
                    }}
                    variant={"contained"} color={"secondary"}>
                    2x Canvas
                </Button>
            </label>

            <div id={"canvas-container"} style={{width: currentCanvasWidth+'px'}}>

                <Draggable bounds="parent" axis="x" {...dragHandlers}>
                    <Button style={{height: "50px", width: "50px", position: "absolute", float: "left"}} variant={"contained"} color={"secondary"}>
                        Drag-Me!
                    </Button>
                </Draggable>

                <canvas id={"canvas-dicom"}
                        ref={canvasDicom}
                        className={classes.canvas}
                        width={currentCanvasWidth}
                        height={currentCanvasWidth} />

            </div>

            {/*<canvas id={"canvas-dicom2"}*/}
            {/*        ref={canvasDicom2}*/}
            {/*        className={classes.canvas}*/}
            {/*        width={currentCanvasWidth}*/}
            {/*        height={currentCanvasWidth} />*/}

            { dicomInfo && getInfoView( dicomInfo ) }
        </div>
    )
}

export default  SplitView;
