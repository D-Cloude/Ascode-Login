var express = require("express");
var router = express.Router();
const { hex_md5 } = require("../src/md5");
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

/* ascod-login */
router.get("/api/ascodelogin", function (req, res, next) {
  const { id, password } = req.query;
  axios
    .get("http://ascode.org/csrf.php")
    .then(function (response) {
      const html = response.data;
      const $ = cheerio.load(html);
      // CSRF 토큰 값을 추출
      const csrfToken = $('input[name="csrf"]').val();
      if (csrfToken) {
        // hidden input 요소가 존재하는 경우 그 value 값을 출력
        const encrypt = hex_md5(password);
        console.log(password);
        const data = qs.stringify({
          user_id: id,
          password: encrypt,
          submit: "",
          csrf: csrfToken,
        });

        const config = {
          method: "post",
          url: "http://ascode.org/login.php",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "http://ascode.org",
            Referer: "http://ascode.org/loginpage.php",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          },
          data: data,
          insecureHTTPParser: true,
        };

        axios(config)
          .then((response) => {
            if (
              response.data ==
              "<script language='javascript'>\nhistory.go(-2);\n</script>"
            ) {
              res.status(200).json({
                result: true,
                message: "인증됨"
              });
            } else {
              res.status(400).json({
                result: false,
                error_msg: response.data,
                message: "비밀번호 또는 아이디를 다시 확인해주세요.",
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        res.status(500).json({
          code: "CSRF token input not found",
          message: "관리자에게 문의해주세요."
        });
      }
    })
    .catch(function (error) {
      // 오류 발생 시 실행할 코드
      res.status(500).json({
        code: "An error occurred while fetching the CSRF token:" + error,
         message: "관리자에게 문의해주세요."
      });
    });
});

module.exports = router;
