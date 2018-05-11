package com.nowcoder.async.handler;

import com.alibaba.fastjson.JSONObject;
import com.nowcoder.async.EventHandler;
import com.nowcoder.async.EventModel;
import com.nowcoder.async.EventType;
import com.nowcoder.model.EntityType;
import com.nowcoder.model.Feed;
import com.nowcoder.model.Question;
import com.nowcoder.model.User;
import com.nowcoder.service.FeedService;
import com.nowcoder.service.FollowService;
import com.nowcoder.service.QuestionService;
import com.nowcoder.service.UserService;
import com.nowcoder.util.JedisAdapter;
import com.nowcoder.util.RedisKeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Created by 周杰伦 on 2018/5/11.
 */
@Component
public class FeedHandler implements EventHandler{

    @Autowired
    UserService userService;

    @Autowired
    QuestionService questionService;

    @Autowired
    FollowService followService;

    @Autowired
    FeedService feedService;

    @Autowired
    JedisAdapter jedisAdapter;

    private String buildFeedData(EventModel eventModel) {
        Map<String, String> map = new HashMap<>();
        User actor = userService.getUser(eventModel.getActorId());
        if (actor == null) {
            return null;
        }
        map.put("userId", String.valueOf(actor.getId()));
        map.put("userHead", actor.getHeadUrl());
        map.put("userName", actor.getName());
        //当评论一个问题或者关注一个问题时，需要获取问题的id和标题，以便加入feed流
        if (eventModel.getType() == EventType.COMMENT ||
                (eventModel.getType() == EventType.FOLLOW) && eventModel.getEntityType() == EntityType.ENTITY_QUESTION) {
            Question question = questionService.getById(eventModel.getEntityId());
            if (question == null) {
                return null;
            }
            map.put("questionId", String.valueOf(question.getId()));
            map.put("questionTitle", question.getTitle());
            return JSONObject.toJSONString(map);
        }
        return null;
    }
    @Override
    public void doHandle(EventModel model) {
        //当一个问题被评论或者被关注，则生成一个feed，加入评论内容以及该用户的信息。
        Feed feed = new Feed();
        feed.setCreatedDate(new Date());
        feed.setUserId(model.getActorId());
        feed.setType(model.getType().getValue());
        feed.setData(buildFeedData(model));

        //存储完数据
        feedService.addFeed(feed);

        //开始向该用户的粉丝推送
        List<Integer> followers = followService.
                getFollowers(EntityType.ENTITY_USER, model.getActorId(), 0, Integer.MAX_VALUE);
        followers.add(0);//0代表系统用户
        for (int follower : followers) {
            String timeLineKey = RedisKeyUtil.getTimelineKey(follower);
            jedisAdapter.lpush(timeLineKey, String.valueOf(feed));
        }

    }

    @Override
    public List<EventType> getSupportEventTypes() {
        return Arrays.asList(new EventType[] {EventType.COMMENT, EventType.FOLLOW});
    }
}
