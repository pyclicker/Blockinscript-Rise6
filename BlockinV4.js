//made by @tygozegthoi , @muqa and @fine

var module = rise.registerModule("blockinV4", "V4")

// Rotation stuff
module.registerSetting("number", "Rotation", 10, 0,10,1)
module.registerSetting("boolean", "Movementfix", true)
module.registerSetting("mode", "Mode","bottom-first", "bottom-first", "side-first","no-middle")

//Delay stuff
module.registerSetting("boolean", "Delay", false)
module.registerSetting("boolean", "Random", false) //broken do not use
module.registerSetting("boundsnumber", "Placedelay", 0, 0,0,20,1)
module.registerSetting("mode", "Delay Mode(when to return)","BeforePlace", "onTick", "BeforePlace")

// Placing and miscellaneous stuff
module.registerSetting("number", "Speedeffect", 0, 0,10,1)
module.registerSetting("boolean", "Swing", true)
module.registerSetting("boolean", "Sneak", true)
module.registerSetting("boolean", "Jump", true)
module.registerSetting("boolean", "Top", true)
module.registerSetting("boolean", "Use rightClick function (most legit)", false)
module.registerSetting("boolean", "Auto-Disable", false)

///------------------------------------------------------\\\
module.setSettingVisibility("Placedelay - Minimal",false)
module.setSettingVisibility("Placedelay - Maximal",false)
module.setSettingVisibility("Delay Mode(when to return)",false)
module.setSettingVisibility("Random",false)
///------------------------------------------------------\\\

script.handle("onUnload", function () {
	module.unregister()
})

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeBlock(blockpos) {
	if (module.getSetting("Delay")&&module.getSetting("Delay Mode(when to return)") == "BeforePlace"){
		if (!module.getSetting("Random")){
			if (sleeptick != 0) {sleeptick -=1;return}
			sleeptick = Math.floor(rand(module.getSetting("Placedelay")[0],module.getSetting("Placedelay")[1]))
		} else {
			if (rand(0,rand(module.getSetting("Placedelay")[0],module.getSetting("Placedelay")[1])) > .1) return
		}
	}
    if (blockpos == null){
            player.rightClick()
        } else
        {
            player.placeBlock(player.getHeldItemStack(), blockpos, 1, rise.newVec3(blockpos.x+1,blockpos.y+0.5,blockpos.z+0.5))
        }
    if (module.getSetting("Swing")) player.swingItem()
}

var surroundedBlocks = 0
var topBlock = false
var startPos = null
var sleeptick = Math.floor(rand(module.getSetting("Placedelay")[0],module.getSetting("Placedelay")[1]))
module.handle("onTick", function(e) {
	if (module.getSetting("Delay")){
		module.setSettingVisibility("Placedelay",true)
		module.setSettingVisibility("Delay Mode(when to return)",true)
		module.setSettingVisibility("Random",true)
		if ((!module.getSetting("Random"))&&module.getSetting("Delay Mode(when to return)") == "onTick"){
			if (sleeptick != 0) {sleeptick -=1;return}
			sleeptick = Math.floor(rand(module.getSetting("Placedelay")[0],module.getSetting("Placedelay")[1]))
		}
		if (module.getSetting("Random")&&module.getSetting("Delay Mode(when to return)") == "onTick") {
			if (rand(0,rand(module.getSetting("Placedelay")[0],module.getSetting("Placedelay")[1])) < .1) return
		}
	}
	else {
		module.setSettingVisibility("Delay Mode(when to return)",false)
		module.setSettingVisibility("Placedelay",false)
		module.setSettingVisibility("Random",false)
	}
	if (startPos != null)
	{
		var p = player.getPosition()
		if ((Math.floor(p.x) !== Math.floor(startPos.x)) || (Math.floor(p.z) !== Math.floor(startPos.z)))
		{
			startPos = null
			//rise.displayChat("reset 1")
		}
		if (player.isOnGround() && surroundedBlocks >= 8)
		{
			startPos = null
			//rise.displayChat("reset 2")
		}
	}

	if ((module.getSetting("Sneak")&&!input.isKeyBindSneakDown()) || rise.getModule("Freecam").isEnabled() || rise.getModule("Scaffold").isEnabled()) return
	if (!player.isHoldingBlock()) {rise.displayChat("Please Hold An Block");module.setEnabled(true);return}
	if (!startPos)
	{
		startPos = player.getPosition()
	}
	var x = Math.floor(startPos.x)
	var y = Math.floor(startPos.y)
	var z = Math.floor(startPos.z)
	switch (module.getSetting("Mode")){
		case "side-first":
			surroundings = [world.newBlockPos(x+1,y,z),world.newBlockPos(x+1,y+1,z), world.newBlockPos(x,y,z+1),world.newBlockPos(x,y+1,z+1), world.newBlockPos(x-1,y,z),world.newBlockPos(x-1,y+1,z), world.newBlockPos(x,y,z-1),world.newBlockPos(x,y+1,z-1)]	
		break;
		case "bottom-first":
			surroundings = [world.newBlockPos(x+1,y,z), world.newBlockPos(x,y,z+1), world.newBlockPos(x-1,y,z), world.newBlockPos(x,y,z-1),world.newBlockPos(x+1,y+1,z), world.newBlockPos(x,y+1,z+1), world.newBlockPos(x-1,y+1,z), world.newBlockPos(x,y+1,z-1)]
		break;
		case "no-middle":
			surroundings = [world.newBlockPos(x+1,y,z),world.newBlockPos(x,y,z+1),world.newBlockPos(x-1,y,z),world.newBlockPos(x,y,z-1),world.newBlockPos(x+1,y+1,z)]
		break;
	}
	var topBlocks = [world.newBlockPos(x+1,y+2,z),world.newBlockPos(x,y+2,z)]

    if (startPos.x - x <= 0.3||startPos.z - z <= 0.3||startPos.x - x >= 0.7||startPos.z - z >= 0.7) {
        var vec = rise.newVec3(x + 0.5, y + 1.5, z + 0.5)
        vec2a = rise.newVec2(vec.x-startPos.x, vec.z-startPos.z)
        player.setRotation(player.calculateRotations(vec),module.getSetting("Rotation"),module.getSetting("Movementfix"))
		strafe = .216
		player.setSneaking(false)
		player.setMotionX(vec2a.x*(strafe+strafe*.2*module.getSetting("Speedeffect")))
		player.setMotionZ(vec2a.y*(strafe+strafe*.2*module.getSetting("Speedeffect")))
    }
	for (i = 0; i < surroundings.length; i++) {
  		if (surroundings[i].getBlock().getId() == 0) {
  			var blockpos = rise.newVec3(surroundings[i].getPosition().x, surroundings[i].getPosition().y-0.5, surroundings[i].getPosition().z)//surroundings[i].getPosition()
			var hitvec = rise.newVec3(blockpos.x + rand(0,1),blockpos.y,blockpos.z + rand(0,1))
  			player.setRotation(player.calculateRotations(rise.newVec3(blockpos.x + 0.5,blockpos.y+0.25,blockpos.z + 0.5)),module.getSetting("Rotation"),module.getSetting("Movementfix"))
            placeBlock(blockpos)
			return
  		}
		else {
			surroundedBlocks += 1
		}
  	}
	if (surroundedBlocks >= surroundings.length && module.getSetting("Top")&&!topBlock)
	{
		//rise.displayChat("as")
		for (var i = 0; i < topBlocks.length; i++)
		{
			if (topBlocks[i].getBlock().getId() == 0 && topBlocks[1].getBlock().getId() == 0) { // we dont need to place if our the block above is already placed
				var blockpos = rise.newVec3(topBlocks[i].getPosition().x, topBlocks[i].getPosition().y-0.5, topBlocks[i].getPosition().z)
				if (i != 1){
					if (player.isOnGround() && (module.getSetting("Jump"))) player.jump() // if it doesn't check the groundstate it will airjump and that is not realy legit
					player.setRotation(player.calculateRotations(rise.newVec3(blockpos.x + 0.5,blockpos.y+0.1,blockpos.z + 0.5)),module.getSetting("Rotation"),module.getSetting("Movementfix"))
                    if (player.getPosition().y < player.getLastPosition().y) { // make sure that we can see the block that we're placing on
                        if (!module.getSetting("Use rightClick function (most legit)")) placeBlock(blockpos)
                        if (module.getSetting("Use rightClick function (most legit)")) placeBlock(null)
                        return
                    }
                    if (!module.getSetting("Jump")) {
                    	player.setRotation(player.calculateRotations(rise.newVec3(blockpos.x+1,blockpos.y+0.5,blockpos.z+0.5)),module.getSetting("Rotation"),module.getSetting("Movementfix"))
                    	placeBlock(blockpos)
                    	return
                	}
                    //else if (!(module.getSetting("Use rightClick function (most legit)"))){
                    	//blockpos = rise.newVec3(topBlocks[i].getPosition().x, topBlocks[i].getPosition().y, topBlocks[i].getPosition().z)
                    	//placeBlock(blockpos)
                    //}
				} else 
				{
					//rise.displayChat("Ran")
					player.setRotation(player.calculateRotations(rise.newVec3(blockpos.x+1,blockpos.y+0.5,blockpos.z+0.5)),module.getSetting("Rotation"),module.getSetting("Movementfix"))
					//if (player.getPosition().y + 1.8 < blockpos.y)
					if (player.isOnGround())
					{
						placeBlock(null)
					}
				}
				return
			}
		}
	}
	if (module.getSetting("Auto-Disable")) module.setEnabled(false)
})
