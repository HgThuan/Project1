import React from 'react'

export default function About() {
  return (
    <div id="coolmate-story">
    <section className="cs-banner">
        <div className="cs-banner__image">
            <img src="../Images/bannerabout.png" alt=""/>
        </div>
    </section>
    <section className="cs-about">
        <div className="container-medium">
            <div className="grid">
                <div className="grid__column four-twelfths">
                    <div className="cs-about__content">
                        <h2 className="cs-about__heading">
                            Với mục đích <br/> đem đến 
                        </h2>
                    </div>
                    <div className="cs-about__image">
                        <img src="https://mcdn.coolmate.me/uploads/April2022/Screen_Shot_2022-03-29_at_17.25_1.png" alt=""/>
                    </div>
                </div>
                <div className="grid__column eight-twelfths">
                    <div className="cs-about__description">
                        <p>Những sản phẩm tuyệt vời nhất cho khách hàng
                            (<a href="#" style={{textDecoration:'underline'}}> Khách hàng là thượng đế</a>)</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
     <section className="cs-caption">
            <div className="container-medium">
                <h2 className="cs-caption__heading">
                    <span>“</span>
                    Hãy mua sắm như một tỷ phú,
                    <br />
                    Chúng tôi mang đến những sản phẩm với mức giá tuyệt vời nhất
                    <br />
                    <span>“</span>
                </h2>
                <span className="cs-caption__author">Vì bạn xứng đáng</span>
            </div>
    </section>
    <section className="cs-story">
        <div className="container-medium">
            <div className="grid grid--mobile-rev">
                <div className="grid__column five-twelfths">
                    <div className="cs-story__image">
                        <img src="../Images/cs-story.png" alt="#"/>
                        <span className="cs-services__alt">Đội ngũ CSKH </span>
                    </div>
                </div>
                <div className="grid__column seven-twelfths">
                    <div className="cs-story__content">
                        <div className="cs-story__heading">
                            Câu chuyện dịch vụ khách Hàng
                            <br className="mobile--hidden"/>
                            
                        </div>
                        <div className="ca-story__description">
                            <p>Theo một khảo sát gần đây nhất của chúng tôi tự thực hiện thì có tới 51% khách hàng quyết định mua sắm  vì ấn tượng với dịch vụ khách hàng. 94% khách hàng sẵn sàng giới thiệu Coolmate với những người khác.</p>
                            <p>Tại đây, chúng tôi tin rằng việc bán một gói hàng đó là bán cả một trải nghiệm mua sắm. Chúng có kỳ vọng trở thành một thương hiệu điển hình về việc hướng tới khách hàng một cách sâu sắc tại Việt Nam. Với mong muốn góp một phần nhỏ thay đổi nhận thức của các doanh nghiệp trong việc mang tới những trải nghiêm tốt hơn cho khách hàng, đặc biệt trong lĩnh vực Thương Mại Điện Tử.</p>
                            <p>Với chính sách đổi trả MIỄN PHÍ và lên tới 60 ngày với bất cứ lý do gì. Chúng tôi đã xây dựng được việc đổi hàng và lấy hàng trả về tận nhà khách hàng, thậm chí chúng tôi thường xuyên gửi sản phẩm mới cho khách hàng trước khi cần thu hồi sản phẩm cũ về. Và điều vui mừng đó là gần đây đã có nhiều hơn các đơn vị vận chuyển chào dịch vụ này và phổ biến hơn ở các bạn bán hàng Online.</p>
                            <p>Nếu bạn cần một nơi để đem đến cho bạn trải nghiệm thời trang tuyệt vời nhất, đây là nơi bạn sẽ muốn đến!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section className="cs-thanks">
        <div className="container-medium">
            <h2 className="cs-thanks__heading">
                Trong cuộc sống có quá  nhiều sự lựa chọn,
                <br/>
                Cảm ơn bạn đã chọn chúng tôi!
            </h2>
            <span>“</span>
        </div>
    </section>
    <section className="cs-more">
        <div className="container-medium">
            <div className="grid grid--aligned-center grid--three-columns">
                <div className="grid__column">
                    Tìm hiểu thêm về chúng tôi<br/>
                    <a href="">để lại câu hỏi nhé</a>
                </div>
                <div className="grid__column">
                    Trải nghiệm mua sắm
                    <br/>
                    <a href=""></a>
                </div>
                <div className="grid__column">
                    Nếu bạn thích
                    <br/>
                    <a href="">hãy đến với </a>
                </div>
            </div>
        </div>
    </section>
</div>
  );
}
