import Head from 'next/head'

export default function Agreement() {
  return (
    <>
      <Head>
        <title>代理商合作协议 - tgesim Agent Portal</title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">tgesim 代理商合作协议</h1>
            <p className="text-gray-400 text-sm">注册并勾选同意即视为接受本协议全部条款</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-sm mb-6">
                <strong>适用对象：</strong>xigro co limited（以下简称"平台"）与代理商之间的合作关系。
              </p>

              <hr className="border-gray-700 my-6" />

              <h2 className="text-xl font-semibold text-orange-400 mb-4">一、充值等级与进货价说明</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
                <li>本平台提供三个充值代理等级：
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><strong>C 级</strong>：充值 $1,000，享优惠进货价</li>
                    <li><strong>B 级</strong>：充值 $1,500，享更低进货价</li>
                    <li><strong>A 级</strong>：充值 $2,000，享最低进货价（利润的 85% 归代理所有）</li>
                  </ul>
                </li>
                <li>进货价基于平台利润计算，具体价格以代理商后台实时显示为准。</li>
                <li>代理可自主设定零售价，进货价与零售价之间的差价收益归代理商所有。</li>
              </ol>

              <hr className="border-gray-700 my-6" />

              <h2 className="text-xl font-semibold text-orange-400 mb-4">二、退款政策</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
                <li><strong>未使用余额可退</strong>：代理商账户中未消费的充值余额可申请退款。</li>
                <li><strong>已下单不可退</strong>：一旦使用余额下单购买 eSIM 产品，该部分金额不可退款。</li>
                <li><strong>退款流程</strong>：
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>联系平台客服提交退款申请</li>
                    <li>提供代理商身份信息及收款钱包地址</li>
                    <li>平台审核通过后 3-5 个工作日内退还至原支付渠道或指定 USDT 钱包</li>
                  </ul>
                </li>
              </ol>

              <hr className="border-gray-700 my-6" />

              <h2 className="text-xl font-semibold text-orange-400 mb-4">三、保密条款</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
                <li>代理商不得向任何第三方泄露平台的进货价、成本结构、利润率等商业机密信息。</li>
                <li>代理商不得截图、传播代理商后台的进货价格页面。</li>
                <li>违反保密条款者，平台有权终止合作并追究法律责任。</li>
              </ol>

              <hr className="border-gray-700 my-6" />

              <h2 className="text-xl font-semibold text-orange-400 mb-4">四、佣金结算</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
                <li><strong>结算周期</strong>：每周结算一次，结算日为每周一。</li>
                <li><strong>支付方式</strong>：USDT（TRC20 网络）支付至代理商绑定的钱包地址。</li>
                <li><strong>最低提现</strong>：累计佣金满 $10 方可申请提现。</li>
                <li>推广代理佣金比例根据产品利润率分级（A 类 80% / B 类 70% / C 类 60%）。</li>
              </ol>

              <hr className="border-gray-700 my-6" />

              <h2 className="text-xl font-semibold text-orange-400 mb-4">五、争议解决</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
                <li>本协议受<strong>香港特别行政区法律</strong>管辖。</li>
                <li>双方发生争议时，应优先通过友好协商解决。</li>
                <li>协商不成的，任何一方可向香港有管辖权的法院提起诉讼。</li>
              </ol>

              <hr className="border-gray-700 my-6" />

              <p className="text-gray-400 text-sm italic">
                <strong>代理商确认：</strong>本人已阅读并同意以上全部条款。
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/register" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
              返回注册
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
