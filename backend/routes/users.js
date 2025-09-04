const router = require('express').Router();
const User = require('../models/User');
const Video = require('../models/Video');
const verifyToken = require('../middleware/auth');

//GET user channel info
router.get('/:id', async(req, res) => {
    try{
        const user = await User.findById(req.params.id).select('-password');

        if(!user){
            return res.status(404).json({ error: 'User not found'});
        }

        //Get user's video
        const videos = await Video.find({ creator: req.params.id}).sort({uploadDate: -1});

        res.json({
            user: {
                id: user._id,
                username: user.username,
                channelName: user.channelName,
                channelDescription: user.channelDescription,
                subscriberCount: user.subscribers.length,
                profilePicture: user.profiilePicture
            },
            videos: videos
        });
        
    }
    catch (error){
        res.status(500).json({ error: error.message});
    }
});

//SUBSCRIBE/UNSUBSCRIBE to channel
router.post('/:id/subscribe', verifyToken, async(req, res) => {
    try{
        const channelToSubscribe = await User.findById(req.params.id);
        const currentUser = User.findById(req.userId);

        if(!channelToSubscribe){
            return res.status(404).json({ error: 'Channel Not found'});
        }

        //cant subsribe to your own channel
        if(req.paramsId === req.userId){
            return res.status(400).json({error: ' cannot subscribe to yourself.'});

        }

        //check if alreaduy subscribed
        const isSubscribed = currentUser.subscribedChannels.includes(req.params.id);

        if(isSubsribed){
            // unsubsribe
            currentUser.subscribedChannels = currentUser.subscribedChannels.filter(
                id => id.toString() !== req.userId
            );

            channelToSubscribe.subscribers = channelToSubscriber.subscribers.filter(
                id => id.toString() !== req.userId
            );
        }
        
        else{
            //subscribe
            currentUser.subscribedChannels.push(req.params.id);
            channelToSubscribe.subscribers.push(req.userId);
        }

        await currentUser.save();
        await channelToSubscribe.save();

        res.json({
            subscribed: !isSubscribed,
            subscriberCount: channelToSubscribe.subscribers.length
        });
        
    }
    catch (error){
        res.status(500).json({error: error.message});
    }
});
module.exports = router;
