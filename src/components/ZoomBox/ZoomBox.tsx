import { Icon, IconButton, VStack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import React, { useCallback } from "react";
import { HiZoomIn, HiZoomOut } from "react-icons/hi";
import { 
    $heightViewbox,
    $originXViewbox,
    $originYViewbox,
    $ratioViewbox,
    $ratioWidthZoom,
    $widthViewbox,
    heightViewboxChange,
    originXViewboxChange,
    originYViewboxChange,
    ratioWidthZoomChange,
    widthViewboxChange,
    zoomDecrement,
    zoomIncrement,
} from "../../state";

import * as classes from "./zoombox.module.css";

export function ZoomBox() {
    const widthViewbox = useStore($widthViewbox);
    const heightViewbox = useStore($heightViewbox);
    const originXViewbox = useStore($originXViewbox);
    const originYViewbox = useStore($originYViewbox);
    const ratioViewbox = useStore($ratioViewbox);
    const ratioWidthZoom = useStore($ratioWidthZoom);

    const handleClickZoomIn = useCallback(() => {
        const linearWidth = document.getElementById("lin")?.clientWidth;

        const xmove = 200;
        
        const newWidthViewbox = widthViewbox - xmove;

        if (newWidthViewbox < 0) {
            return;
        }

        zoomIncrement(1);

        const newHeightViewbox = newWidthViewbox * ratioViewbox;

        if (linearWidth) {
            ratioWidthZoomChange(linearWidth / newWidthViewbox);
        }

        heightViewboxChange(newHeightViewbox);
        widthViewboxChange(newWidthViewbox);

        originXViewboxChange(originXViewbox + xmove / 2);
        originYViewboxChange(originYViewbox + (xmove / 2) * ratioViewbox);
    }, [widthViewbox, heightViewbox, ratioViewbox, originXViewbox, originYViewbox]);

    const handleClickZoomOut = useCallback(() => {
        const linearWidth = document.getElementById("lin")?.clientWidth;

        const xmove = 200;

        const newWidthViewbox = widthViewbox + xmove;

        zoomDecrement(1);

        const newHeightViewbox = newWidthViewbox * ratioViewbox;

        if (linearWidth) {
            ratioWidthZoomChange(linearWidth / newWidthViewbox);
        }

        heightViewboxChange(newHeightViewbox);
        widthViewboxChange(newWidthViewbox);

        originXViewboxChange(originXViewbox - xmove / 2);
        originYViewboxChange(originYViewbox - (xmove / 2) * ratioViewbox);


    }, [widthViewbox, heightViewbox, ratioViewbox, originXViewbox, originYViewbox]);

	return (
        <div 
            id="zoomBox" 
            className={classes.zoomBox}
        >
            <VStack alignItems={"flex-end"}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Увеличить масштаб'
                    size='sm'
                    fontSize='20px'
                    onClick={handleClickZoomIn}
                    icon={<Icon as={HiZoomIn} color='cyan.50' />}
                />
                <IconButton
                    colorScheme='teal'
                    aria-label='Уменьшить масштаб'
                    size='sm'
                    fontSize='20px'
                    onClick={handleClickZoomOut}
                    icon={<Icon as={HiZoomOut} color='cyan.50' />}
                />
            </VStack>
            <div 
                id="scaleVal"  
                className={`${classes.boxShadow} ${classes.scaleVal}`}  
                style={{ width:`${window.editorVars.METER * ratioWidthZoom}px` }}
            >
                1m
            </div>
        </div>
	);
}