var Participation={
    cmds:[],
    getUIDs:function(charas){
        return charas.map(function(chara){
            return chara.id;
        });
    },
    getUnitsByUIDs:function(uids){
        return Unit.allUnits.filter(function(chara){
            //Need filter out dead units to execute commands
            return uids.indexOf(chara.id)!=-1 && chara.status!='dead';
        });
    },
	 getUnitByID:function(id){
        return Unit.allUnits.filter(function(chara){
            //Need filter out dead units to execute commands
            return id===chara.id && chara.status!='dead';
        })[0];
    }
};
