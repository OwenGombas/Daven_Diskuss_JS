class ItemList {
    constructor(element, items = []) {
        this.Items = items;     // Contients tous les Items (Type = Liste (Channel ou User dans ce cas))
        this.Element = element; // L'element HTML de la liste (Type = HTML-Element)
    }

    addItem(item) {
        let exist = false;
        this.Items.forEach(el => {
            exist = el.compareTo(item);
        });
        
        if(!exist) {
            this.Items.push(item);               // Ajoute l'Item à ma liste de Items (Type = User ou Channel)
            this.Element.append(item.Element);   // Ajoute l'Element HTML de l'Item (Type = HTML-Element)
        }
    }

    removeItem(item) {
        this.Items.forEach(el => {
            if(el.compareTo(item)) {
                this.Items.splice(this.Items.indexOf(el), 1);
            }
        });
        item.Element.remove();
    }
}

class ConvList extends ItemList {
    constructor(element, items = []) {
        super(element, items);
        this.ConvSelected;
    }

    addItem(item) {
        item.Element.on('click', () => {
            if(this.ConvSelected)
                this.ConvSelected.select(false);
            this.ConvSelected = item;
            item.select(true);
        });
        super.addItem(item);
    }
}

class User {
    constructor(user) {
        this.User = user;
        this.Element = $(`
            <div>
                <div class="item bubble" data-nick="${user.nick}">
                    <span data-nick="${user.nick}">${user.nick[0].toUpperCase()}</span>
                </div>
            </div>`).on('click', () => {
                peopleList.removeItem(this);
                chat.addItem(new Conv(this));
            });
    }

    compareTo(user) {
        return user instanceof User ? this.User.nick === user.User.nick : false;
    }
}

class Channel {
    constructor(channel) {
        this.Channel = channel;
        this.Element = $(`
            <div>
                <div class="item circle" data-nick="${channel.name}">
                    <span data-nick="${channel.name}">${channel.name[0].toUpperCase()}</span>
                </div>
            </div>`).on('click', () => {
                channelList.removeItem(this);
                chat.addItem(new Conv(this));
                request(`user/${app.usr.id}/channels/${channel.name}/join/`, () => {}, 'PUT');  // Rejoint le channel
            });
    }

    compareTo(channel) {
        return channel instanceof Channel ? this.Channel.name === channel.Channel.name && this.Channel.owner === channel.Channel.owner : false;
    }
}

class Conv {
    constructor(object) {
        this.Object = object;
        this.Messages = [];
        this.Element = object.Element.clone();
        this.Element.html(`
            <div class="conv">
                ${object.Element.html()}
                <div class="conv-details">
                    <h1>${object instanceof User ? object.User.nick : object.Channel.name}</h1>
                    <p>last message</p>
                </div>
            </div>`);
        this.Element.find('.conv').append($(`
            <div class="close-conv">
                <?xml version="1.0" encoding="iso-8859-1"?>
                <!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 348.333 348.334" style="enable-background:new 0 0 348.333 348.334;" xml:space="preserve">
                    <g>
                        <path d="M336.559,68.611L231.016,174.165l105.543,105.549c15.699,15.705,15.699,41.145,0,56.85   c-7.844,7.844-18.128,11.769-28.407,11.769c-10.296,0-20.581-3.919-28.419-11.769L174.167,231.003L68.609,336.563   c-7.843,7.844-18.128,11.769-28.416,11.769c-10.285,0-20.563-3.919-28.413-11.769c-15.699-15.698-15.699-41.139,0-56.85   l105.54-105.549L11.774,68.611c-15.699-15.699-15.699-41.145,0-56.844c15.696-15.687,41.127-15.687,56.829,0l105.563,105.554   L279.721,11.767c15.705-15.687,41.139-15.687,56.832,0C352.258,27.466,352.258,52.912,336.559,68.611z" fill="#FFFFFF"/>
                    </g>
                </svg>
            </div>
        `).on('click', () => {
            // A OPTIMISER SI DANS LES TEMPS
            // Quand je clique sur la croix de la Conv je: 
            // - L'enleve de ma liste de Conv (chat)
            // - Si c'est une instance de User je l'ajoute a la liste de peopleList sinon à la liste de channelList et je le fais quitter le channel
            chat.removeItem(this);
            if(this.Object instanceof User){
                peopleList.addItem(new User(this.Object.User)) // Je recrer l'element car je par le "on('click', ... )"
            } else {
                request(`user/${app.usr.id}/channels/${this.Object.Channel.name}/leave/`, () => {}, 'DELETE');  // Quitte le channel
                channelList.addItem(new Channel(this.Object.Channel));
            }
        }));
    }

    select(onOff){
        onOff ? this.Element.addClass('selected') : this.Element.removeClass('selected');
    }

    compareTo(conv) {
        return this.Object.compareTo(conv.Object);
    }
}

class Message {
    constructor(Author, Message) {
        this.Author = Author;
        this.Message = Message;
    }
}
