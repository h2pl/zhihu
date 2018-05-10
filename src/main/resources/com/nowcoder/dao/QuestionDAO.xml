<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.nowcoder.dao.QuestionDAO">
    <sql id="table">question</sql>
    <sql id="selectFields">id, title, content, comment_count,created_date,user_id
    </sql>
    <select id="selectLatestQuestions" resultType="com.nowcoder.model.Question">
        SELECT
        <include refid="selectFields"/>
        FROM
        <include refid="table"/>

        <if test="userId != 0">
            WHERE user_id = #{userId}
        </if>
        ORDER BY id DESC
        LIMIT #{offset},#{limit}
    </select>
</mapper>
