

$._PPP_={
    createMarker : function (t, r, s, sp, nme, cin, cout) {
        var newMark = app.project.activeSequence.markers.createMarker(cin);
        newMark.setTypeAsComment();
        newMark.name = "Opt- " + nme;

        newMark.comments = "" + t + "\r" + s + "\r" + r + "\r" + sp;
        newMark.setColorByIndex(5);
        //(color index and marker index)
        //exampleMarker.start= Start Time in Seconds Goes Here,
        //exampleMarker.end= End Time in Seconds Goes Here.
    },

    analyseOpticals : function () {
		var activeSeq = app.project.activeSequence;
        var numRepoClips = 0;
        var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
        var tapename = "Column.Intrinsic.TapeName";
        var durations = "Column.Intrinsic.MediaDuration";
        var AdobeXMPScript;
        var validTracks = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
        var numopticals = 0;
        var valid = false;
        // create adobe XMP object
        if (AdobeXMPScript === undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }


		if (activeSeq) {
            // check its the right one
            if(prompt('Is the correct sequence timeline?\n' + activeSeq.name + '\ny or n', 'n', 'Right Sequence?') !== 'y'){
                app.setSDKEventMessage("Didn't run, try getting the active sequence correct.", 'error');
                return
            }

			// var trackGroups		= [activeSeq.videoTracks];
			// var trackGroupNames = ["audioTracks", "videoTracks"];
			var updateUI 		= true;
            var group = activeSeq.videoTracks;
            var trackchoice = parseInt(prompt('Which video track to analyse? Number between 1-15', '1', 'Which Video Track?')) - 1;

            for (var t = 0; t < validTracks.length; t++){
                if (trackchoice === validTracks[t]){
                    valid = true;
                }
            }

            if(valid === false || trackchoice > group.numTracks){
                app.setSDKEventMessage("Bad Track Number.", 'error');
                return
            }

            //for (var trackIndex = 0; trackIndex < group.numTracks; trackIndex++) {
            var track = group[trackchoice];
            var clips = track.clips;
            for (var clipIndex = 0; clipIndex < clips.numItems; clipIndex++) {
                // set our lists
                // var pos = 'test'
                var x = 'none'
                var y = 'none'
                var scl = 'Scale: 100%'
                var rot = 'Rotation: none'
                var spd = 'Speed: 1.0'
                var optical = false;
                var speedmult = 1;

                //get the clip
                var clip = clips[clipIndex];
                //get the componenets of the clip
                var effects = clip.components; 
                var sourcename = clip.name;

                //check if the clip is a premiere graphic before we continue
                if(sourcename === 'Graphic' && clip.projectItem === null){
                    continue
                }

                var clipfps = clip.projectItem.getFootageInterpretation().frameRate;
                var clipstart = clip.start.seconds;
                var clipend = clip.end.seconds;
                var clipin = clip.inPoint.seconds;
                var clipout = clip.outPoint.seconds;


                /////////////////////////////////
                /////////////////////////////////
                // speed first as it effects key frames
                var isReversed	= clip.isSpeedReversed();
                if (clip.getSpeed() !== 1 || isReversed) {
                    speedmult = clip.getSpeed();
                    // normalise clip in and out for speed change
                    clipin = clipin * speedmult;
                    clipout = clipout * speedmult;
                    //optical = true;
                    spd = 'Speed: ' + clip.getSpeed();
                    if (isReversed) {
                        // somehow got to get the duration of the clip in fractions of seconds
                        // then swap 0 from end to 0 from start?
                        // length from start to length from end
                        // ie 2 seconds clipin is now (length minus 2 seconds)
                        // 2 seconds in from the end is now (0 plus 2 seconds)

                        var projectMetadata = clip.projectItem.getProjectMetadata();
                        var xmp = new XMPMeta(projectMetadata);
                        var testduration = xmp.getProperty(kPProPrivateProjectMetadataURI, durations);
                        // create the duration in seconds fraction
                        testduration = testduration.value.split(":");
                        var hours = ((parseInt(testduration[0]) * 60)*60); 
                        var mins = parseInt(testduration[1])*60;   
                        var frm = parseInt(testduration[3])/clipfps;
                        var sourcelength = parseInt(testduration[2]) + frm + mins + hours;
                        // reverse normalised in and out compensation for key frame direction
                        clipin = sourcelength - clipout;
                        clipout = sourcelength - clipin;

                        spd = spd.concat(' Reversed');
                    }
                    

                }

                // translation 
                var position = effects[1].properties[0].getValue();
                if (position[0] !== 0.5 || position[1] !== 0.5 || effects[1].properties[0].getKeys()){
                    //optical = true;
                    // pos = [position[0], position[1]]
                    if (position[0] !== 0.5){
                        var x = 'yes';
                    }

                    if (position[1] !== 0.5){
                        var y = 'yes';
                    }

                    if (effects[1].properties[0].getKeys()){
                        var y = 'Anim';
                        var x = 'Anim';
                    }
                    //premiere uses a fraction of the screen to calculate translate 0.5 is the center if the anchor is also 0.5
                }
                var pos = "Tranform x: " + x + "  Transform y: " + y;


                // scale
                var scaleh = effects[1].properties[1].getValue();
                var scalew = effects[1].properties[2].getValue();
                if (scaleh !== 100.00 || scalew !== 100.00 || effects[1].properties[1].getKeys() || effects[1].properties[2].getKeys()){
                    optical = true;
                    if (effects[1].properties[1].getKeys()){

                        // find key frames if any
                        var scalekeysh = effects[1].properties[1].getKeys();

                        // this is pretty sloppy but would be good to reverse how we loop in the case we are on a reversed clip
                        if(isReversed){
                            for (var keyIndex = (scalekeysh.length-1); keyIndex >= 0; keyIndex--) {
                                var keyscale = effects[1].properties[1].getValueAtKey(scalekeysh[keyIndex].seconds).toFixed(2);
    
                                // check if keys are outside the range of the clips in and out
                                if (scalekeysh[keyIndex].seconds > clipout){
                                    keyscale = effects[1].properties[1].getValueAtTime(clipout).toFixed(2);
                                }
                                if (scalekeysh[keyIndex].seconds < clipin){
                                    keyscale = effects[1].properties[1].getValueAtTime(clipin).toFixed(2);
                                }
    
                                // if its the first key frame
                                if (keyIndex === (scalekeysh.length-1)){
                                    var scl = 'Scale: Anim : ' + keyscale + '%';
                                } else {
                                    scl = scl.concat('  ->  ' + keyscale + '%');
                                }
                            }

                        } else {
                            for (var keyIndex = 0; keyIndex < scalekeysh.length; keyIndex++) {
                                var keyscale = effects[1].properties[1].getValueAtKey(scalekeysh[keyIndex].seconds).toFixed(2);

                                // check if keys are outside the range of the clips in and out
                                if (scalekeysh[keyIndex].seconds > clipout){
                                    keyscale = effects[1].properties[1].getValueAtTime(clipout).toFixed(2);
                                }
                                if (scalekeysh[keyIndex].seconds < clipin){
                                    keyscale = effects[1].properties[1].getValueAtTime(clipin).toFixed(2);
                                }

                                // if its the first key frame
                                if (keyIndex === 0){
                                    var scl = 'Scale: Anim : ' + keyscale + '%';
                                } else {
                                    scl = scl.concat('  ->  ' + keyscale + '%');
                                }
                            }
                        }
                    
                    // else if no key frames
                    } else {
                        if (effects[1].properties[3].getValue()){
                            var scl = 'Scale: ' + scaleh.toFixed(2) + '%';
                        } else {
                            var scl = 'Scale x:' + scaleh.toFixed(2) + '%  ' + 'Scale y:' + scalew.toFixed(2) + '%';
                        }
                    }
                }
                    
                // rotation
                var rotation = effects[1].properties[4].getValue();
                if (rotation !== 0 || effects[1].properties[4].getKeys()){
                    //optical = true;
                    rot = 'Rotation:' + rotation.toFixed(2);
                    if (effects[1].properties[4].getKeys()){
                        rot = 'Rotation: Anim'
                    }
                }

                // if we have no optical continue without checking reel names
                if(optical === false){
                    continue
                } else {
                    numopticals += 1;
                }

                // get the tape name
                var projectMetadata = clip.projectItem.getProjectMetadata();
                var xmp = new XMPMeta(projectMetadata);
                var found_tapename = xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, tapename);

                if (found_tapename){
                    sourcename = xmp.getProperty(kPProPrivateProjectMetadataURI, tapename);
                }


                this.createMarker(pos,rot,scl,spd,sourcename,clipstart,clipend);                
            }	            
            app.setSDKEventMessage(numopticals + " opticals added.", 'info');
		} else {
            app.setSDKEventMessage("No active sequence.", 'error');
		}
    }
}



$._PPP_.analyseOpticals();
