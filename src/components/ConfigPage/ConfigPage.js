import React from 'react'
import Authentication from '../../util/Authentication/Authentication'

import './Config.css'
import '../../util/bootstrap.min.css'

export default class ConfigPage extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'light',
            key:'',
        }
    }

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    componentDidMount(){
        // do config page setup as needed here
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId)
                if(!this.state.finishedLoading){
                    this.getAPIKey().finally(() => {
                        // We've finished loading
                        this.setState(()=>{
                            return {finishedLoading:true}
                        });
                    })
                }
            })
    
            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }
    }

    getAPIKey(){
        return this.Authentication.makeCall("https://sts-tracker.nitrated.net/view_api_key", "POST").then(response => response.json())
        .then(v => {
            this.setState(() => {
                return {key : v.key}
            });
        }).catch(e => {
            console.log(e);
        });
    }

    render(){
        if(this.state.finishedLoading && this.Authentication.isModerator()){
            return(
                <div className="Config">
                    <div className={this.state.theme==='light' ? 'Config-light' : 'Config-dark'}>
                        <label htmlFor="api-key">Your API key:</label>
                        <div className="input-group mb-3">
                            <input type="password" className="form-control" id="api-key" value={this.state.key} readOnly={true} />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button" onClick={() => {navigator.clipboard.writeText(this.state.key)}}>Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else{
            return(
                <div className="Config">
                    <div className={this.state.theme==='light' ? 'Config-light' : 'Config-dark'}>
                        Loading...
                    </div>
                </div>
            )
        }
    }
}