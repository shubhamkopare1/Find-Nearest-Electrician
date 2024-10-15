class ExpressError extends Error{
    constructor(statuCode,message){
        super()
        this.statuCode=statuCode;
        this.message= message
    }
    }
    module.exports=ExpressError