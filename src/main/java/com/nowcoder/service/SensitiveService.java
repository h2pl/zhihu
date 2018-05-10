package com.nowcoder.service;

import org.apache.commons.lang.CharUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.ibatis.annotations.Param;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;

import javax.swing.tree.TreeNode;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by 周杰伦 on 2018/5/10.
 */
@Service
public class SensitiveService implements InitializingBean{
    public static final Logger logger = LoggerFactory.getLogger(SensitiveService.class);
    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            InputStream inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream("SensitiveWords.txt");
            InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
            BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
            String linetxt;
            while ((linetxt = bufferedReader.readLine()) != null) {
                addWord(linetxt);
            }
            inputStreamReader.close();
        }catch (Exception e) {
            logger.error("读取敏感词文件失败！" + e.getMessage());
        }
    }
    //在字典树中增加关键词，这里指敏感词
    private void addWord(String lineTxt) {
        TrieNode trieNode = root;
        for (int i = 0; i < lineTxt.length(); i++) {
            Character c = lineTxt.charAt(i);

            TrieNode node = root.getSubNode(c);
            if (node == null) {
                node = new TrieNode();
                trieNode.addSubNode(c, node);
            }

            trieNode = node;
            if (i == lineTxt.length() - 1) {
                trieNode.setKeyWordEnd(true);
            }
        }
    }
    //构造字典树数据结构
    private class TrieNode {
        //是不是关键词的结尾
        private boolean end = false;

        //当前结点下所有的子节点
        private Map<Character, TrieNode> subNodes = new HashMap<>();

        public void addSubNode(Character key, TrieNode trieNode) {
            subNodes.put(key, trieNode);
        }

        public TrieNode getSubNode(Character key) {
            return subNodes.get(key);
        }

        public boolean isKeyWordEnd() {
            return end;
        }

        public void setKeyWordEnd(boolean end) {
            this.end = end;
        }
    }
    private TrieNode root = new TrieNode();

    //过滤特殊符号
    private boolean isSymbol(char c) {
        int ic = (int)c;
        //东亚文字 0x2E80-0x9FFF
        return !CharUtils.isAsciiAlphanumeric(c) && (ic < 0x2E80 || ic > 0x9FFF);
    }

    //敏感词过滤核心代码
    public String filter(String text) {
        if (StringUtils.isBlank(text)) {
            return text;
        }

        String replacement = "***";
        TrieNode trieNode = root;
        int begin = 0;
        int position = 0;

        StringBuilder res = new StringBuilder();

        while (position < text.length()) {
            char c = text.charAt(position);
            //如果是开头的特殊符号，那么就添加上，并且begin后移。
            if (isSymbol(c)) {
                if (trieNode == root) {
                    res.append(c);
                    ++begin;
                }
                //无论是开头还是过滤过程之间，position都要后移。
                ++position;
                continue;
            }
            trieNode = trieNode.getSubNode(c);

            if (trieNode == null) {
                res.append(text.charAt(position));
                position = begin + 1;
                begin = position;
                trieNode = root;
            }else if (trieNode.isKeyWordEnd()) {
                res.append(replacement);
                position = position + 1;
                begin = position;
                trieNode = root;
            }else {
                ++ position;
            }
        }
        //最后一段字符串别忘了加
        res.append(text.substring(begin));
        return res.toString();
    }

    public static void main(String[] args) {
        SensitiveService sensitiveService = new SensitiveService();
        sensitiveService.addWord("赌博");
        sensitiveService.addWord("色情");
        System.out.println(sensitiveService.filter("你好色情"));
    }
}
