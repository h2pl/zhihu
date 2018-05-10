package com.nowcoder.service;

import com.nowcoder.util.JedisAdapter;
import com.nowcoder.util.RedisKeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Transaction;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * Created by 周杰伦 on 2018/5/10.
 */
@Service
public class FollowService {

    @Autowired
    JedisAdapter jedisAdapter;

    public boolean follow(int userId, int entityType, int entityId) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(userId, entityType);
        String followerKey = RedisKeyUtil.getFollowerKey(entityType, entityId);
        Date date = new Date();
        Jedis jedis = jedisAdapter.getJedis();
        Transaction tx = jedisAdapter.multi(jedis);
        tx.zadd(followeeKey, date.getTime(), String.valueOf(entityId));
        tx.zadd(followerKey, date.getTime(), String.valueOf(userId));
        List<Object> ret = jedisAdapter.exec(tx, jedis);
        boolean res = ret.size() == 2 && (long)ret.get(0) > 0 && (long)ret.get(1) > 0;
        return res;
    }

    public boolean unfollow(int userId, int entityType, int entityId) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(userId, entityType);
        String followerKey = RedisKeyUtil.getFollowerKey(entityType, entityId);
        Date date = new Date();
        Jedis jedis = jedisAdapter.getJedis();
        Transaction tx = jedisAdapter.multi(jedis);
        tx.zrem(followeeKey, String.valueOf(entityId));
        tx.zrem(followerKey, String.valueOf(userId));
        List<Object> ret = jedisAdapter.exec(tx, jedis);
        boolean res = ret.size() == 2 && (long)ret.get(0) > 0 && (long)ret.get(1) > 0;
        return res;
    }

    public List<Integer> getIdsFromSet(Set<String> set) {
        List<Integer> ids = new ArrayList<>();
        for (String s : set) {
            ids.add(Integer.parseInt(s));
        }
        return ids;
    }

    public List<Integer> getFollowers(int entityType, int entityId,int offset, int count) {
        String followerKey = RedisKeyUtil.getFollowerKey(entityType,entityId);
        return getIdsFromSet(jedisAdapter.zrange(followerKey, offset, count));
    }

    public List<Integer> getFollowees(int userId, int entityType,int offset, int count) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(userId,entityType);
        return getIdsFromSet(jedisAdapter.zrange(followeeKey, offset, count));
    }

    public long getFollowerCount(int entityType, int entityId) {
        String followerKey = RedisKeyUtil.getFollowerKey(entityType,entityId);
        return jedisAdapter.zcard(followerKey);
    }

    public long getFolloweeCount(int entityType, int entityId) {
        String followeeKey = RedisKeyUtil.getFolloweeKey(entityType,entityId);
        return jedisAdapter.zcard(followeeKey);
    }

    public boolean isFollower(int userId, int entityType, int entityId) {
        String followerKey = RedisKeyUtil.getFollowerKey(entityType,entityId);
        return jedisAdapter.zscore(followerKey, String.valueOf(userId)) != null;


    }
}
