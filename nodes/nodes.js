class Node {
    self = this;
    constructor(id, type, next) {
        this.id = id;
        this.next = next;
        this.type = type;
    }

    toNext() {
        
    }
}

class DialogueNode extends Node {
    constructor(id, next, text) {
        super(id, "dialogue", next);
        this.text = text;
    }

    displayText(textbox) {
        
    }
}

class ChoiceNode extends Node {

}

class ShowSpriteNode extends Node {

}