import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import {TextFilter} from 'react-text-filter';

import { Cards, Relics } from '../../util/STSStore/STSStore'
import { STSCard } from '../STSAsset/STSCard'

import './App.scss'
import '../../util/bootstrap.min.css'
import { STSRelic } from '../STSAsset/STSRelic';

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'light',
            isVisible:true,
            menuItem:'deck',
            cards :[],
            relics :[],
            filter :'',
        }
        this.onClickMenuItem = this.onClickMenuItem.bind(this);
        this.onFilter = this.onFilter.bind(this);
    }

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    visibilityChanged(isVisible){
        this.setState(()=>{
            return {
                isVisible
            }
        })
    }

    loadCards(){
        return this.Authentication.makeCall("https://sts-tracker.nitrated.net/get", "GET").then(response => response.json())
        .then(v => {
            if (this.state.cards !== v.cards || this.state.relics !== v.relics) {
                this.setState(() => {
                    return { 
                        cards : v.cards,
                        relics : v.relics,
                    }
                });
            }
        }).catch(e => {
            console.log(e);
        });
    }

    componentDidMount(){
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId);


                if(!this.state.finishedLoading){
                    this.loadCards().finally(() => {
                        // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                        this.setState(()=>{
                            // start the refresh timer
                            this.interval = setInterval(() => this.loadCards(), 5000);
                            return {finishedLoading:true}
                        });
                    });
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.
                }
            })

            this.twitch.listen('broadcast',(target,contentType,body)=>{
                this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
                // now that you've got a listener, do something with the result...
            })

            this.twitch.onVisibilityChanged((isVisible,_c)=>{
                this.visibilityChanged(isVisible)
            })

            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }
    }

    componentWillUnmount(){
        if(this.twitch){
            this.twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'))
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    
    onClickMenuItem(item) {
        if (item === 'deck' || item === 'relics') {
            this.setState({menuItem : item});
        }
    }

    onFilter(filter) {
        this.setState({filter})
    }

    render(){
        if(this.state.finishedLoading && this.state.isVisible){
            const isLightTheme = this.state.theme === 'light';
            
            var cardListClasses = isLightTheme ? 'card-list-light' : 'card-list-dark';
            cardListClasses += ' card-list';

            const appTheme = 'App mb-0 ' + (isLightTheme ? 'App-light' : 'App-dark');

            var deckMenuItem = 'nav-item w-50 text-center';
            var deckLinkStyle = 'nav-link font-large';

            if (this.state.menuItem === 'deck') {
                deckMenuItem += ' active bb-6';
                deckLinkStyle += ' text-white ';
            } else {
                deckLinkStyle += ' inactive';
            }

            var relicMenuItem = 'nav-item w-50 text-center';
            var relicLinkStyle = 'nav-link font-large';

            if (this.state.menuItem === 'relics') {
                relicMenuItem += ' active bb-6';
                relicLinkStyle += ' text-white';
            } else {
                relicLinkStyle += ' inactive';
            }

            // build up our card list
            var card_counts = {};

            for (const card of this.state.cards) {
                const upgrades = parseInt(card.upgrades);

                var card_name = card.id;
                
                if (upgrades === 1) {
                    card_name += "+";
                } else if (upgrades > 1) {
                    card_name += "+" + card.upgrades;
                }

                if (!(card_name in card_counts)) {
                    card_counts[card_name] = 0;
                }

                card_counts[card_name] += 1;
            }

            const assetFilter = (asset) => asset.name.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1;
            
            const gucci = Object.keys(card_counts).map((key) => {
                if (Cards[key] === undefined) {
                    console.log(key);
                } else {
                    if (assetFilter(Cards[key])) {
                        return <STSCard type="card" asset={Cards[key]} cardCount={card_counts[key]} />
                    }
                }
            });
            
            const gucci_r = this.state.relics.map((item) => {
                if (Relics[item] === undefined) {
                    if (item !== 'Circlet') {
                        // Somehow we have a missing relic - log it.
                        console.log(item);
                    }
                } else {
                    if (assetFilter(Relics[item])) {
                        return <STSRelic filter={this.state.filter} asset={Relics[item]} />
                    }
                }
            });

            return (
                <div className={appTheme}>
                    <div className="header-light d-flex justify-content-between align-items-center">
                        <div className={deckMenuItem} onMouseDown={() => this.onClickMenuItem("deck")}>
                            <a className={deckLinkStyle}  href="#">Deck</a>
                        </div>
                        <div className={relicMenuItem} onMouseDown={() => this.onClickMenuItem("relics")}>
                            <a className={relicLinkStyle}  href="#">Relics</a>
                        </div>
                    </div>
                    {this.state.menuItem === 'deck' && <div className={cardListClasses}>
                        {gucci}
                    </div>}
                    {this.state.menuItem === 'relics' && <div className={cardListClasses}>
                        {gucci_r}
                    </div>}
                    <div className="p-0 m-0 footer">
                        <TextFilter className="pl-1 w-100 h-100 font-small" minLength={1} onFilter={({target: {value: filter}}) => this.onFilter(filter)} />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="App">
                </div>
            )
        }

    }
}