package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private ConcurrentHashMap<String, ConcurrentLinkedQueue> polygon = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        if(!polygon.containsKey(numdibujo)) {
            polygon.put(numdibujo, new ConcurrentLinkedQueue<Point>());
        } else {
            polygon.get(numdibujo).add(pt);
            if(polygon.get(numdibujo).size() >= 3) {
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon.get(numdibujo));
            }

        }

    }

}
