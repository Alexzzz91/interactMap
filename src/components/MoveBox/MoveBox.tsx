import { Grid, GridItem, Icon, IconButton,} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { 
    HiOutlineArrowCircleDown, 
    HiOutlineArrowCircleLeft, 
    HiOutlineArrowCircleRight, 
    HiOutlineArrowCircleUp, 
    HiOutlineEye,
} from "react-icons/hi";
import { 
    originXViewboxDecrement,
    originXViewboxIncrement,
    originXViewboxReset,
    originYViewboxDecrement,
    originYViewboxIncrement,
    originYViewboxReset,
    zoomReset,
} from "../../state";

import * as classes from "./movebox.module.css";

export function MoveBox() {
    const handleClickTop = useCallback(() => {
        originYViewboxDecrement(50);

    }, []);
    const handleClickRight = useCallback(() => {
        originXViewboxIncrement(50);
    }, []);
    const handleClickCenter = useCallback(() => {        
        zoomReset();
        originXViewboxReset();
        originYViewboxReset();
    }, []);
    const handleClickLeft = useCallback(() => {
        originXViewboxDecrement(50);
        
    }, []);
    const handleClickBottom = useCallback(() => {
        originYViewboxIncrement(50);
    }, []);

	return (
        <div 
            id="moveBox" 
            className={classes.moveBox}
        >

        <Grid
            templateAreas={`"top top top"
                            "left center right"
                            "bottom bottom bottom"`}
            gridTemplateRows={"1fr 1fr 1fr"}
            gridTemplateColumns={"1fr 1fr 1fr"}
            h='95px'
            w='95px'
            gap='1'
            color='blackAlpha.700'
            fontWeight='bold'
        >
            <GridItem area={"top"}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Шаг наверх'
                    size='sm'
                    fontSize='20px'
                    data-way='top'
                    onClick={handleClickTop}
                    icon={<Icon as={HiOutlineArrowCircleUp} color='cyan.50' />}
                />
            </GridItem>
            <GridItem area={"right"}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Шаг в право'
                    size='sm'
                    fontSize='20px'
                    data-way='right'
                    onClick={handleClickRight}
                    icon={<Icon as={HiOutlineArrowCircleRight} color='cyan.50' />}
                />
            </GridItem>
            <GridItem area={"center"}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Отцентровать'
                    size='sm'
                    fontSize='20px'
                    data-way='center'
                    onClick={handleClickCenter}
                    icon={<Icon as={HiOutlineEye} color='cyan.50' />}
                />

            </GridItem>
            <GridItem area={"left"}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Шаг в лево'
                    size='sm'
                    fontSize='20px'
                    data-way='left'
                    onClick={handleClickLeft}
                    icon={<Icon as={HiOutlineArrowCircleLeft} color='cyan.50' />}
                />
            </GridItem>
            <GridItem area={"bottom"}>
                <IconButton
                    colorScheme='teal'
                    aria-label='Шаг в низ'
                    size='sm'
                    fontSize='20px'
                    data-way='bottom'
                    onClick={handleClickBottom}
                    icon={<Icon as={HiOutlineArrowCircleDown} color='cyan.50' />}
                />
            </GridItem>
        </Grid>

        {/* <div 
            className="pull-right" 
            style={{ margin: "10px" }}
        >
            
            <p style={{margin:"0"}}>
                <button 
                    className="btn btn-xs btn-info zoom"
                    data-zoom="zoomtop" 
                    style={{boxShadow: "2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-up" aria-hidden="true"></i>
                </button>
            </p>
            <p style={{margin:"0"}}>
                <button 
                    className="btn btn-xs btn-info zoom" 
                    data-zoom="zoomleft" 
                    style={{boxShadow: "2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-left" aria-hidden="true"></i>
                </button>
                <button 
                    className="btn btn-xs btn-default zoom" 
                    data-zoom="zoomreset" 
                    style={{boxShadow: "2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-bullseye" aria-hidden="true"></i>
                </button>
                <button 
                    className="btn btn-xs btn-info zoom"
                    data-zoom="zoomright" 
                    style={{boxShadow:"2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </button>
            </p>
            <p style={{margin:"0"}}>
                <button 
                    className="btn btn-xs btn-info zoom" 
                    data-zoom="zoombottom" 
                    style={{boxShadow:"2px 2px 3px #ccc"}}
                >
                    <i className="fa fa-arrow-down" aria-hidden="true"></i>
                </button>
            </p>
        </div> */}
      </div>
	);
}
