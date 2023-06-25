// var viewIDs = app.getProjectViewIDs();
// var selectedItems = app.getProjectViewSelection(viewIDs[0]);

// var itemAttr = selectedItems[0];

// var MCeffects = selectedItems[0].videoComponents();

// var blur = MCeffects[0];

// alert(MCeffects[0]);

$._PPP_={
    selectAllRetimedClips : function () {
		var activeSeq 		= app.project.activeSequence;
		var numRetimedClips = 0;
		if (activeSeq) {
			// var trackGroups		= [activeSeq.audioTracks, activeSeq.videoTracks];
			// var trackGroupNames = ["audioTracks", "videoTracks"];
			var updateUI 		= true;
            var group = activeSeq.videoTracks;
            for (var trackIndex = 0; trackIndex < group.numTracks; trackIndex++) {
                var track = group[trackIndex];
                var clips = track.clips;
                for (var clipIndex = 0; clipIndex < clips.numItems; clipIndex++) {
                    var clip = clips[clipIndex];
                    var isReversed	= clip.isSpeedReversed();
                    if (clip.getSpeed() !== 1 || isReversed) {
                        clip.setSelected(true, updateUI);
                        numRetimedClips++;
                    }
                }
            }
			            
            app.setSDKEventMessage(numRetimedClips + " retimed clips found.", 'info');
		} else {
            app.setSDKEventMessage("No active sequence.", 'info');
		}
    }

}

$._PPP_.selectAllRetimedClips();
