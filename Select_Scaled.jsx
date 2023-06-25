// var viewIDs = app.getProjectViewIDs();
// var selectedItems = app.getProjectViewSelection(viewIDs[0]);

// var itemAttr = selectedItems[0];

// var MCeffects = selectedItems[0].videoComponents();

// var blur = MCeffects[0];

// alert(MCeffects[0]);

$._PPP_={
    selectScaled : function () {
		var activeSeq 		= app.project.activeSequence;
		var numScaledClips = 0;
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
                    var scaleh = effects[1].properties[1].getValue();
                    var scalew = effects[1].properties[2].getValue();
                    if (scaleh !== 100 || scalew !== 100 || effects[1].properties[1].getKeys() || effects[1].properties[2].getKeys()){
                        clip.setSelected(true, updateUI);
                        numScaledClips++;
                    }

                }
            }
			            
            app.setSDKEventMessage(numScaledClips + " scaled clips found.", 'info');
		} else {
            app.setSDKEventMessage("No active sequence.", 'info');
		}
    }

}

$._PPP_.selectScaled();
