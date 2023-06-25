// var viewIDs = app.getProjectViewIDs();
// var selectedItems = app.getProjectViewSelection(viewIDs[0]);

// var itemAttr = selectedItems[0];

// var MCeffects = selectedItems[0].videoComponents();

// var blur = MCeffects[0];

// alert(MCeffects[0]);

$._PPP_={
    selectRepo : function () {
		var activeSeq 		= app.project.activeSequence;
		var numRepoClips = 0;
		if (activeSeq) {
			// var trackGroups		= [activeSeq.videoTracks];
			// var trackGroupNames = ["audioTracks", "videoTracks"];
			var updateUI 		= true;
            var group = activeSeq.videoTracks;
            for (var trackIndex = 0; trackIndex < group.numTracks; trackIndex++) {
                var track = group[trackIndex];
                var clips = track.clips;
                for (var clipIndex = 0; clipIndex < clips.numItems; clipIndex++) {
                    var clip = clips[clipIndex];
                    var effects = clip.components; 
                    var position = effects[1].properties[0].getValue();
                    if (position[0] !== 0.5 || position[1] !== 0.5 || effects[1].properties[0].getKeys()){
                        clip.setSelected(true, updateUI);
                        numRepoClips++;
                    }
                }
            }		            
            app.setSDKEventMessage(numRepoClips + " transformed clips found.", 'info');
		} else {
            app.setSDKEventMessage("No active sequence.", 'info');
		}
    }
}

$._PPP_.selectRepo();
