import { Router } from "express";
import { DispatchEvent } from "src/interfaces/pubSub.interface";
import { start, stop, reconect, status, getStatusEventUserCase } from "../userCases";

export const router = Router();
router.get("/start", start);
router.get("/stop", stop);
router.get("/reconect", reconect);
router.get("/status", status);

export const dispathEvents: DispatchEvent = ({ event, data }) => {
    console.log("***-> Evento: ", event);
    console.log("***-> payload: ", data);
    switch (event) {
        case "GET_STATUS": {
            getStatusEventUserCase(data);
        }
    }
};