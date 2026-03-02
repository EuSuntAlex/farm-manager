package com.manager.farm.listeners;

import com.manager.farm.pages.evenimentPage.Eveniment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class EvenimentCreatedEvent extends ApplicationEvent {
    private final Eveniment eveniment;

    public EvenimentCreatedEvent(Object source, Eveniment eveniment) {
        super(source);
        this.eveniment = eveniment;
    }
}