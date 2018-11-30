<?php

namespace App\Controllers;

class UsersController extends Controller {

    public function getUser($request, $response, $args) {
        $name = $args['name'];

        $sql = "SELECT * FROM users WHERE MATCH(name) AGAINST('$name*' IN BOOLEAN MODE)";

        try {
            $stmt = $this->db->prepare($sql);
            
            $user = $this->db->query($sql)->fetchAll(\PDO::FETCH_OBJ);

            $stmt->execute();
        } catch(PDOException $e) {
            echo '{"error": {"text": '.$e->getMessage().'}}';
        }
        
        $res = json_encode($user);
        return $res;
    }

    public function getAllUsers($request, $response, $args) {
        $id = $args['id'];
        $start = $args['start'];
        $end = $args['end'];

        $sql = $end ? 
        "SELECT * FROM users WHERE NOT (id = $id) LIMIT $start, $end" : 
        "SELECT * FROM users WHERE NOT (id = $id)";

        try {
            $stmt = $this->db->prepare($sql);

            $users = $this->db->query($sql)->fetchAll(\PDO::FETCH_OBJ);

            $stmt->execute();
        } catch(PDOException $e) {
            echo '{"error": {"text": '.$e->getMessage().'}}';
        }
        
        $res = json_encode($users);
        return $res;
    }

    public function getLastUser($request, $response, $args) {
        $id = $request->getParam('id');

        $sql = "SELECT * FROM users ORDER BY ID DESC LIMIT 1";

        try {
            $stmt = $this->db->prepare($sql);

            $user = $this->db->query($sql)->fetchAll(\PDO::FETCH_OBJ);

            $stmt->execute();
        } catch(PDOException $e) {
            echo '{"error": {"text": '.$e->getMessage().'}}';
        }
        
        $res = json_encode($user);
        return $res;
    }

    public function getAllFriends($request, $response, $args) {
        $id = $args['id'];

       $sql = "SELECT * FROM relationship WHERE (status = 1 AND user_one_id = $id) OR (status = 1 AND user_two_id = $id)";

        try {
            $stmt = $this->db->prepare($sql);

            $friends = $this->db->query($sql)->fetchAll(\PDO::FETCH_OBJ);

            $stmt->execute();
        } catch(PDOException $e) {
            echo '{"error": {"text": '.$e->getMessage().'}}';
        }

        if(!$friends) return json_encode([]);

        $users_ids = array_map(function($item) use ($id) {
            return $item->user_one_id === $id ? $item->user_two_id : $item->user_one_id;
        }, $friends);

        $sql = "SELECT * FROM users WHERE id IN (".implode(',',$users_ids).")";

        try {
            $stmt = $this->db->prepare($sql);

            $friends = $this->db->query($sql)->fetchAll(\PDO::FETCH_OBJ);

            $stmt->execute();
        } catch(PDOException $e) {
            echo '{"error": {"text": '.$e->getMessage().'}}';
        }

        return json_encode($friends);
    }

    public function deleteFriend($request, $response, $args) {
        $friend_id            = $args['friendId'];
        $user_id              = $args['userId'];

        $user_one_id = $user_id > $friend_id ? $friend_id : $user_id;
        $user_two_id = $friend_id < $user_id ? $user_id : $friend_id;
        
        $sql = "DELETE FROM relationship WHERE user_one_id = $user_one_id OR user_two_id = $user_two_id";

        try {
            $stmt = $this->db->prepare($sql);

            $stmt->execute();
        } catch(PDOException $e) {
            echo '{"error": {"text": '.$e->getMessage().'}}';
        }

        return json_encode($user_one_id, $user_two_id );
    }
}